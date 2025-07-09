import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAffiliate } from '@/hooks/useAffiliate';
import { 
  Copy, 
  Users, 
  Gift, 
  Star, 
  Crown, 
  ExternalLink,
  Coins
} from 'lucide-react';

const AffiliateSection = () => {
  const { 
    stats, 
    rewards, 
    loading, 
    redeemCredits, 
    getReferralLink, 
    copyReferralLink, 
    getRewardTypeLabel 
  } = useAffiliate();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeemCredits = async (rewardType: 'premium_month' | 'business_month') => {
    setRedeeming(rewardType);
    try {
      await redeemCredits(rewardType);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading affiliate data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Unable to load affiliate data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const referralLink = getReferralLink();

  return (
    <div className="space-y-6">
      {/* Affiliate Overview */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Affiliate Program</CardTitle>
          </div>
          <CardDescription>
            Earn credits for every successful referral and redeem them for subscription upgrades!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-primary">{stats.total_referrals}</div>
              <div className="text-sm text-muted-foreground">Total Referrals</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-orange-500">{stats.credits_available}</div>
              <div className="text-sm text-muted-foreground">Available Credits</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-green-500">{stats.total_credits_earned}</div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-purple-500">{stats.active_rewards}</div>
              <div className="text-sm text-muted-foreground">Active Rewards</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <Label htmlFor="referral-link">Your Referral Link</Label>
            <div className="flex gap-2">
              <Input
                id="referral-link"
                value={referralLink}
                readOnly
                className="bg-muted/50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyReferralLink}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(referralLink, '_blank')}
                className="shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link to earn 10 credits for each successful signup!
            </p>
          </div>

          {/* Referral Code */}
          <div className="flex items-center justify-center p-4 bg-primary/10 rounded-lg border-2 border-dashed border-primary/30">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Your Referral Code</div>
              <div className="text-2xl font-mono font-bold text-primary">{stats.referral_code}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits & Rewards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Credit Store */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-orange-500" />
              <CardTitle>Credit Store</CardTitle>
            </div>
            <CardDescription>
              Redeem your credits for subscription upgrades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Available Credits:</span>
              <Badge variant="secondary" className="text-orange-500 font-bold">
                {stats.credits_available} credits
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              {/* Premium Month */}
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Premium Month</div>
                    <div className="text-xs text-muted-foreground">100 appointments/month</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">30 credits</div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={stats.credits_available < 30 || redeeming === 'premium_month'}
                    onClick={() => handleRedeemCredits('premium_month')}
                  >
                    {redeeming === 'premium_month' ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              </div>

              {/* Business Month */}
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Business Month</div>
                    <div className="text-xs text-muted-foreground">1000 appointments/month</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">50 credits</div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={stats.credits_available < 50 || redeeming === 'business_month'}
                    onClick={() => handleRedeemCredits('business_month')}
                  >
                    {redeeming === 'business_month' ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Rewards */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              <CardTitle>Active Rewards</CardTitle>
            </div>
            <CardDescription>
              Your current active subscription benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active rewards</p>
                <p className="text-sm">Redeem credits to get subscription upgrades</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">
                        {getRewardTypeLabel(reward.reward_type)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {reward.expires_at 
                          ? `Expires: ${new Date(reward.expires_at).toLocaleDateString()}`
                          : 'No expiration'
                        }
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium mb-2">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral link with friends and colleagues
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium mb-2">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                When they register, they get 1 month Premium free and you earn 10 credits
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium mb-2">Redeem Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Use your credits to unlock Premium (30) or Business (50) subscription months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSection;