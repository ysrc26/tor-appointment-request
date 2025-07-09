-- Fix the type mismatch in get_affiliate_stats function
DROP FUNCTION IF EXISTS public.get_affiliate_stats(uuid);

CREATE OR REPLACE FUNCTION public.get_affiliate_stats(p_user_id uuid)
 RETURNS TABLE(referral_code text, total_referrals integer, pending_referrals integer, completed_referrals integer, phone_verified_referrals integer, subscription_referrals integer, total_credits_earned integer, credits_used integer, credits_available integer, credits_pending integer, active_rewards integer, next_credit_award_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    urc.referral_code,
    COALESCE(ref_stats.total_referrals, 0)::integer as total_referrals,
    COALESCE(ref_stats.pending_referrals, 0)::integer as pending_referrals,
    COALESCE(ref_stats.completed_referrals, 0)::integer as completed_referrals,
    COALESCE(ref_stats.phone_verified_referrals, 0)::integer as phone_verified_referrals,
    COALESCE(ref_stats.subscription_referrals, 0)::integer as subscription_referrals,
    COALESCE(ac.credits_earned, 0) as total_credits_earned,
    COALESCE(ac.credits_used, 0) as credits_used,
    COALESCE(ac.credits_available, 0) as credits_available,
    COALESCE(pending_stats.pending_credits, 0)::integer as credits_pending,
    COALESCE(rewards_count.active_rewards, 0)::integer as active_rewards,
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
      COUNT(*) as pending_credits,
      MIN(created_at + interval '7 days') as next_credit_award_date
    FROM public.affiliate_referrals 
    WHERE referrer_user_id = p_user_id 
    AND affiliate_referrals.credits_pending = true
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
$function$;

-- Fix missing subscriber records
INSERT INTO public.subscribers (user_id, email, subscription_tier, subscribed, monthly_limit)
SELECT 
  u.auth_user_id,
  u.email,
  u.subscription_tier,
  false,
  CASE 
    WHEN u.subscription_tier = 'free' THEN 10
    WHEN u.subscription_tier = 'premium' THEN 50
    WHEN u.subscription_tier = 'business' THEN 200
    ELSE 10
  END
FROM public.users u
WHERE u.auth_user_id NOT IN (SELECT user_id FROM public.subscribers WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;