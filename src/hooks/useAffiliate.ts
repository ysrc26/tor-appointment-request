import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AffiliateStats {
  referral_code: string;
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  total_credits_earned: number;
  credits_used: number;
  credits_available: number;
  active_rewards: number;
}

interface AffiliateReward {
  id: string;
  reward_type: string;
  credits_cost: number;
  applied_at: string;
  expires_at: string | null;
  status: string;
}

export const useAffiliate = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [rewards, setRewards] = useState<AffiliateReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchAffiliateData();
    }
  }, [userProfile]);

  const fetchAffiliateData = async () => {
    if (!userProfile?.id) return;

    try {
      // Fetch affiliate stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_affiliate_stats', { p_user_id: userProfile.id });

      if (statsError) {
        console.error('Error fetching affiliate stats:', statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      } else {
        // No stats yet, generate referral code
        await generateReferralCode();
      }

      // Fetch active rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('affiliate_rewards')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('status', 'active')
        .order('applied_at', { ascending: false });

      if (rewardsError) {
        console.error('Error fetching rewards:', rewardsError);
      } else {
        setRewards(rewardsData || []);
      }
    } catch (error) {
      console.error('Error in fetchAffiliateData:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    if (!userProfile?.id) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_user_referral_code', { p_user_id: userProfile.id });

      if (error) {
        console.error('Error generating referral code:', error);
        return null;
      }

      // Refresh stats after generating code
      await fetchAffiliateData();
      return data;
    } catch (error) {
      console.error('Error in generateReferralCode:', error);
      return null;
    }
  };

  const redeemCredits = async (rewardType: 'premium_month' | 'business_month') => {
    if (!userProfile?.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('redeem_credits', { 
          p_user_id: userProfile.id, 
          p_reward_type: rewardType 
        });

      if (error) {
        console.error('Error redeeming credits:', error);
        toast({
          title: "Redemption Failed",
          description: "Failed to redeem credits. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data) {
        toast({
          title: "Credits Redeemed Successfully!",
          description: `You've successfully redeemed ${rewardType === 'premium_month' ? 'Premium' : 'Business'} subscription for 1 month.`,
        });
        // Refresh data
        await fetchAffiliateData();
        return true;
      } else {
        toast({
          title: "Insufficient Credits",
          description: "You don't have enough credits for this reward.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error in redeemCredits:', error);
      toast({
        title: "Redemption Error",
        description: "An error occurred while redeeming credits.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getReferralLink = () => {
    if (!stats?.referral_code) return '';
    return `${window.location.origin}/auth?ref=${stats.referral_code}`;
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const getRewardTypeLabel = (rewardType: string) => {
    switch (rewardType) {
      case 'premium_month':
        return 'Premium Month';
      case 'business_month':
        return 'Business Month';
      case 'referral_bonus':
        return 'Referral Bonus';
      default:
        return rewardType;
    }
  };

  return {
    stats,
    rewards,
    loading,
    generateReferralCode,
    redeemCredits,
    getReferralLink,
    copyReferralLink,
    getRewardTypeLabel,
    refreshData: fetchAffiliateData
  };
};