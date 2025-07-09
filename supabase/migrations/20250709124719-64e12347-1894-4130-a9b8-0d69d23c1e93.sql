-- Create affiliate referrals table to track who referred whom
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referral_code, referred_user_id)
);

-- Create affiliate credits table to track earned credits/points
CREATE TABLE public.affiliate_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_earned INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_available INTEGER GENERATED ALWAYS AS (credits_earned - credits_used) STORED,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate rewards table to track applied rewards
CREATE TABLE public.affiliate_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_type TEXT NOT NULL, -- 'premium_month', 'business_month', 'referral_bonus'
  credits_cost INTEGER NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' -- active, expired, used
);

-- Create user referral codes table for unique referral links
CREATE TABLE public.user_referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_referrals
CREATE POLICY "Users can view their referrals" 
ON public.affiliate_referrals 
FOR SELECT 
USING (
  referrer_user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid()) OR
  referred_user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid())
);

CREATE POLICY "System can manage referrals" 
ON public.affiliate_referrals 
FOR ALL 
USING (true);

-- RLS Policies for affiliate_credits
CREATE POLICY "Users can view their own credits" 
ON public.affiliate_credits 
FOR SELECT 
USING (user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid()));

CREATE POLICY "System can manage credits" 
ON public.affiliate_credits 
FOR ALL 
USING (true);

-- RLS Policies for affiliate_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.affiliate_rewards 
FOR SELECT 
USING (user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid()));

CREATE POLICY "System can manage rewards" 
ON public.affiliate_rewards 
FOR ALL 
USING (true);

-- RLS Policies for user_referral_codes
CREATE POLICY "Users can view their own referral code" 
ON public.user_referral_codes 
FOR SELECT 
USING (user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid()));

CREATE POLICY "Anyone can view referral codes for signup" 
ON public.user_referral_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own referral code" 
ON public.user_referral_codes 
FOR INSERT 
WITH CHECK (user_id IN (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid()));

-- Functions for affiliate system

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code with letters and numbers
    v_code := upper(substring(md5(random()::text || p_user_id::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.user_referral_codes WHERE referral_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to get or create user referral code
CREATE OR REPLACE FUNCTION public.get_user_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Try to get existing code
  SELECT referral_code INTO v_code 
  FROM public.user_referral_codes 
  WHERE user_id = p_user_id;
  
  -- If no code exists, create one
  IF v_code IS NULL THEN
    v_code := public.generate_referral_code(p_user_id);
    
    INSERT INTO public.user_referral_codes (user_id, referral_code)
    VALUES (p_user_id, v_code);
  END IF;
  
  RETURN v_code;
END;
$$;

-- Function to process referral signup
CREATE OR REPLACE FUNCTION public.process_referral_signup(p_referred_user_id UUID, p_referral_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_user_id UUID;
  v_referral_exists BOOLEAN;
BEGIN
  -- Find referrer by code
  SELECT user_id INTO v_referrer_user_id 
  FROM public.user_referral_codes 
  WHERE referral_code = p_referral_code;
  
  -- If referrer not found, return false
  IF v_referrer_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if referral already exists
  SELECT EXISTS(
    SELECT 1 FROM public.affiliate_referrals 
    WHERE referred_user_id = p_referred_user_id
  ) INTO v_referral_exists;
  
  -- If referral already exists, return false
  IF v_referral_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Create referral record
  INSERT INTO public.affiliate_referrals (referrer_user_id, referred_user_id, referral_code, status)
  VALUES (v_referrer_user_id, p_referred_user_id, p_referral_code, 'completed');
  
  -- Award 10 credits to referrer
  INSERT INTO public.affiliate_credits (user_id, credits_earned)
  VALUES (v_referrer_user_id, 10)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits_earned = affiliate_credits.credits_earned + 10,
    last_updated = now();
  
  -- Give referred user 1 month premium free (add reward)
  INSERT INTO public.affiliate_rewards (user_id, reward_type, credits_cost, expires_at)
  VALUES (p_referred_user_id, 'referral_bonus', 0, now() + interval '1 month');
  
  RETURN TRUE;
END;
$$;

-- Function to redeem credits for rewards
CREATE OR REPLACE FUNCTION public.redeem_credits(p_user_id UUID, p_reward_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits_needed INTEGER;
  v_available_credits INTEGER;
  v_months INTEGER;
BEGIN
  -- Determine credits needed and duration
  CASE p_reward_type
    WHEN 'premium_month' THEN 
      v_credits_needed := 30;
      v_months := 1;
    WHEN 'business_month' THEN 
      v_credits_needed := 50;
      v_months := 1;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check available credits
  SELECT credits_available INTO v_available_credits
  FROM public.affiliate_credits
  WHERE user_id = p_user_id;
  
  -- If not enough credits
  IF v_available_credits IS NULL OR v_available_credits < v_credits_needed THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.affiliate_credits
  SET credits_used = credits_used + v_credits_needed,
      last_updated = now()
  WHERE user_id = p_user_id;
  
  -- Add reward
  INSERT INTO public.affiliate_rewards (user_id, reward_type, credits_cost, expires_at)
  VALUES (p_user_id, p_reward_type, v_credits_needed, now() + (v_months || ' months')::interval);
  
  RETURN TRUE;
END;
$$;

-- Function to get affiliate stats for user
CREATE OR REPLACE FUNCTION public.get_affiliate_stats(p_user_id UUID)
RETURNS TABLE(
  referral_code TEXT,
  total_referrals BIGINT,
  pending_referrals BIGINT,
  completed_referrals BIGINT,
  total_credits_earned INTEGER,
  credits_used INTEGER,
  credits_available INTEGER,
  active_rewards BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    urc.referral_code,
    COALESCE(ref_stats.total_referrals, 0) as total_referrals,
    COALESCE(ref_stats.pending_referrals, 0) as pending_referrals,
    COALESCE(ref_stats.completed_referrals, 0) as completed_referrals,
    COALESCE(ac.credits_earned, 0) as total_credits_earned,
    COALESCE(ac.credits_used, 0) as credits_used,
    COALESCE(ac.credits_available, 0) as credits_available,
    COALESCE(rewards_count.active_rewards, 0) as active_rewards
  FROM public.user_referral_codes urc
  LEFT JOIN public.affiliate_credits ac ON ac.user_id = urc.user_id
  LEFT JOIN (
    SELECT 
      referrer_user_id,
      COUNT(*) as total_referrals,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals
    FROM public.affiliate_referrals 
    WHERE referrer_user_id = p_user_id
    GROUP BY referrer_user_id
  ) ref_stats ON ref_stats.referrer_user_id = urc.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as active_rewards
    FROM public.affiliate_rewards
    WHERE user_id = p_user_id AND status = 'active' AND (expires_at IS NULL OR expires_at > now())
    GROUP BY user_id
  ) rewards_count ON rewards_count.user_id = urc.user_id
  WHERE urc.user_id = p_user_id;
END;
$$;