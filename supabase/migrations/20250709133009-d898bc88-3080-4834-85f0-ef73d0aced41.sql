-- Add IP tracking table for fraud prevention
CREATE TABLE public.referral_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET,
  referral_code TEXT,
  referred_user_id UUID,
  action_type TEXT NOT NULL, -- 'signup', 'phone_verified', 'subscription_purchased'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Add columns to affiliate_referrals for fraud prevention
ALTER TABLE public.affiliate_referrals 
ADD COLUMN ip_address INET,
ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN subscription_purchased BOOLEAN DEFAULT FALSE,
ADD COLUMN credits_pending BOOLEAN DEFAULT TRUE,
ADD COLUMN credits_awarded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN fraud_score INTEGER DEFAULT 0;

-- Add columns to affiliate_credits for tracking
ALTER TABLE public.affiliate_credits 
ADD COLUMN credits_pending INTEGER DEFAULT 0;

-- Enable RLS for activity log
ALTER TABLE public.referral_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for activity log
CREATE POLICY "System can manage activity log" 
ON public.referral_activity_log 
FOR ALL 
USING (true);

-- Updated process_referral_signup function with fraud prevention
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referred_user_id UUID, 
  p_referral_code TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_user_id UUID;
  v_referral_exists BOOLEAN;
  v_ip_count INTEGER;
  v_fraud_score INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Find referrer by code
  SELECT user_id INTO v_referrer_user_id 
  FROM public.user_referral_codes 
  WHERE referral_code = p_referral_code;
  
  -- If referrer not found, return error
  IF v_referrer_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Check if referral already exists
  SELECT EXISTS(
    SELECT 1 FROM public.affiliate_referrals 
    WHERE referred_user_id = p_referred_user_id
  ) INTO v_referral_exists;
  
  IF v_referral_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already referred');
  END IF;
  
  -- Check IP address usage in last 7 days
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO v_ip_count
    FROM public.referral_activity_log 
    WHERE ip_address = p_ip_address 
    AND action_type = 'signup'
    AND created_at > now() - interval '7 days';
    
    -- More than 3 signups from same IP in 7 days = suspicious
    IF v_ip_count > 3 THEN
      v_fraud_score := v_fraud_score + 50;
    END IF;
  END IF;
  
  -- Create referral record (credits pending)
  INSERT INTO public.affiliate_referrals (
    referrer_user_id, 
    referred_user_id, 
    referral_code, 
    status,
    ip_address,
    fraud_score,
    credits_pending
  )
  VALUES (
    v_referrer_user_id, 
    p_referred_user_id, 
    p_referral_code, 
    'pending',
    p_ip_address,
    v_fraud_score,
    true
  );
  
  -- Log activity
  INSERT INTO public.referral_activity_log (
    ip_address, 
    referral_code, 
    referred_user_id, 
    action_type,
    metadata
  )
  VALUES (
    p_ip_address, 
    p_referral_code, 
    p_referred_user_id, 
    'signup',
    jsonb_build_object('fraud_score', v_fraud_score)
  );
  
  -- Give referred user 1 month premium free (immediate)
  INSERT INTO public.affiliate_rewards (user_id, reward_type, credits_cost, expires_at)
  VALUES (p_referred_user_id, 'referral_bonus', 0, now() + interval '1 month');
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Referral registered. Credits will be awarded after 7 days and phone verification.',
    'fraud_score', v_fraud_score
  );
END;
$$;

-- Function to award credits after phone verification
CREATE OR REPLACE FUNCTION public.process_phone_verification(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_record RECORD;
BEGIN
  -- Find referral record for this user
  SELECT * INTO v_referral_record
  FROM public.affiliate_referrals 
  WHERE referred_user_id = p_user_id 
  AND credits_pending = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update referral record
  UPDATE public.affiliate_referrals 
  SET 
    phone_verified = true,
    status = 'phone_verified'
  WHERE id = v_referral_record.id;
  
  -- Log activity
  INSERT INTO public.referral_activity_log (
    ip_address, 
    referral_code, 
    referred_user_id, 
    action_type
  )
  VALUES (
    v_referral_record.ip_address, 
    v_referral_record.referral_code, 
    p_user_id, 
    'phone_verified'
  );
  
  RETURN TRUE;
END;
$$;

-- Function to award credits after subscription purchase
CREATE OR REPLACE FUNCTION public.process_subscription_purchase(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_record RECORD;
BEGIN
  -- Find referral record for this user
  SELECT * INTO v_referral_record
  FROM public.affiliate_referrals 
  WHERE referred_user_id = p_user_id 
  AND credits_pending = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update referral record
  UPDATE public.affiliate_referrals 
  SET 
    subscription_purchased = true,
    status = 'subscription_purchased'
  WHERE id = v_referral_record.id;
  
  -- Log activity
  INSERT INTO public.referral_activity_log (
    ip_address, 
    referral_code, 
    referred_user_id, 
    action_type
  )
  VALUES (
    v_referral_record.ip_address, 
    v_referral_record.referral_code, 
    p_user_id, 
    'subscription_purchased'
  );
  
  RETURN TRUE;
END;
$$;

-- Function to award credits (runs daily via cron)
CREATE OR REPLACE FUNCTION public.award_pending_credits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_record RECORD;
  v_credits_awarded INTEGER := 0;
BEGIN
  -- Find referrals ready for credit award
  FOR v_referral_record IN 
    SELECT * FROM public.affiliate_referrals 
    WHERE credits_pending = true
    AND phone_verified = true
    AND created_at <= now() - interval '7 days'
    AND fraud_score < 75 -- Don't award if fraud score too high
  LOOP
    -- Base credits for phone verification
    INSERT INTO public.affiliate_credits (user_id, credits_earned)
    VALUES (v_referral_record.referrer_user_id, 10)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      credits_earned = affiliate_credits.credits_earned + 10,
      last_updated = now();
    
    -- Bonus credits if subscription purchased
    IF v_referral_record.subscription_purchased THEN
      INSERT INTO public.affiliate_credits (user_id, credits_earned)
      VALUES (v_referral_record.referrer_user_id, 20)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        credits_earned = affiliate_credits.credits_earned + 20,
        last_updated = now();
    END IF;
    
    -- Mark credits as awarded
    UPDATE public.affiliate_referrals 
    SET 
      credits_pending = false,
      credits_awarded_at = now(),
      status = 'completed'
    WHERE id = v_referral_record.id;
    
    v_credits_awarded := v_credits_awarded + 1;
  END LOOP;
  
  RETURN v_credits_awarded;
END;
$$;

-- Updated get_affiliate_stats function
CREATE OR REPLACE FUNCTION public.get_affiliate_stats(p_user_id UUID)
RETURNS TABLE(
  referral_code TEXT,
  total_referrals BIGINT,
  pending_referrals BIGINT,
  completed_referrals BIGINT,
  phone_verified_referrals BIGINT,
  subscription_referrals BIGINT,
  total_credits_earned INTEGER,
  credits_used INTEGER,
  credits_available INTEGER,
  credits_pending INTEGER,
  active_rewards BIGINT,
  next_credit_award_date TIMESTAMP WITH TIME ZONE
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
    COALESCE(ref_stats.phone_verified_referrals, 0) as phone_verified_referrals,
    COALESCE(ref_stats.subscription_referrals, 0) as subscription_referrals,
    COALESCE(ac.credits_earned, 0) as total_credits_earned,
    COALESCE(ac.credits_used, 0) as credits_used,
    COALESCE(ac.credits_available, 0) as credits_available,
    COALESCE(pending_stats.credits_pending, 0) as credits_pending,
    COALESCE(rewards_count.active_rewards, 0) as active_rewards,
    pending_stats.next_credit_award_date
  FROM public.user_referral_codes urc
  LEFT JOIN public.affiliate_credits ac ON ac.user_id = urc.user_id
  LEFT JOIN (
    SELECT 
      referrer_user_id,
      COUNT(*) as total_referrals,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals,
      COUNT(*) FILTER (WHERE phone_verified = true) as phone_verified_referrals,
      COUNT(*) FILTER (WHERE subscription_purchased = true) as subscription_referrals
    FROM public.affiliate_referrals 
    WHERE referrer_user_id = p_user_id
    GROUP BY referrer_user_id
  ) ref_stats ON ref_stats.referrer_user_id = urc.user_id
  LEFT JOIN (
    SELECT 
      referrer_user_id,
      COUNT(*) as credits_pending,
      MIN(created_at + interval '7 days') as next_credit_award_date
    FROM public.affiliate_referrals 
    WHERE referrer_user_id = p_user_id 
    AND credits_pending = true
    AND phone_verified = true
    GROUP BY referrer_user_id
  ) pending_stats ON pending_stats.referrer_user_id = urc.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as active_rewards
    FROM public.affiliate_rewards
    WHERE user_id = p_user_id AND status = 'active' AND (expires_at IS NULL OR expires_at > now())
    GROUP BY user_id
  ) rewards_count ON rewards_count.user_id = urc.user_id
  WHERE urc.user_id = p_user_id;
END;
$$;