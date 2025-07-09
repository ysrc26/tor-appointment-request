import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

interface PricingPlansProps {
  showTitle?: boolean;
  compact?: boolean;
}

const PricingPlans = ({ showTitle = true, compact = false }: PricingPlansProps) => {
  const { user } = useAuth();
  const { 
    limits, 
    createCheckoutSession, 
    openCustomerPortal,
    getSubscriptionTierLabel,
    getSubscriptionTierLimits 
  } = useSubscription();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: '',
      icon: Star,
      description: 'Perfect to get started',
      features: ['10 appointments per month', 'Basic client management', 'Simple calendar'],
      buttonText: 'Start Free',
      popular: false,
      action: () => {}
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.90,
      period: '/month',
      icon: Crown,
      description: 'For growing businesses',
      features: [
        '100 appointments per month',
        'Advanced client management',
        'Full calendar',
        'SMS reminders',
        'Basic reports',
        'Email support'
      ],
      buttonText: 'Upgrade to Premium',
      popular: true,
      action: () => createCheckoutSession('premium')
    },
    {
      id: 'business',
      name: 'Business',
      price: 49.90,
      period: '/month',
      icon: Zap,
      description: 'For advanced businesses',
      features: [
        '1000 appointments per month',
        'All features',
        'Advanced reports',
        'API access',
        'Priority support',
        'Data analytics',
        'Advanced integrations'
      ],
      buttonText: 'Upgrade to Business',
      popular: false,
      action: () => createCheckoutSession('business')
    }
  ];

  const currentTier = limits?.subscription_tier || 'free';

  const getButtonText = (planId: string) => {
    if (!user) return 'Sign in to get started';
    
    if (planId === currentTier) {
      return planId === 'free' ? 'Current Plan' : 'Manage Subscription';
    }
    
    return plans.find(p => p.id === planId)?.buttonText || 'Choose Plan';
  };

  const getButtonAction = (planId: string) => {
    if (!user) return () => {};
    
    if (planId === currentTier && planId !== 'free') {
      return openCustomerPortal;
    }
    
    return plans.find(p => p.id === planId)?.action || (() => {});
  };

  const isCurrentPlan = (planId: string) => planId === currentTier;
  const isUpgrade = (planId: string) => {
    const planOrder = { free: 0, premium: 1, business: 2 };
    return planOrder[planId as keyof typeof planOrder] > planOrder[currentTier as keyof typeof planOrder];
  };

  return (
    <div className="space-y-8">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose the plan that's right for you
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade anytime. All plans include automatic backup and full support.
          </p>
        </div>
      )}

      <div className={`grid gap-6 ${compact ? 'md:grid-cols-3' : 'lg:grid-cols-3'} max-w-6xl mx-auto`}>
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const canUpgrade = isUpgrade(plan.id);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative border-border/50 ${
                plan.popular 
                  ? 'border-primary/50 shadow-lg' 
                  : isCurrent 
                    ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
                    : ''
              } hover:shadow-medium transition-all duration-200`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              {isCurrent && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      plan.popular ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? 'Free' : `₪${plan.price}`}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 ml-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6"
                  variant={
                    plan.popular 
                      ? 'default' 
                      : isCurrent 
                        ? 'outline' 
                        : 'outline'
                  }
                  disabled={isCurrent && plan.id === 'free'}
                  onClick={getButtonAction(plan.id)}
                >
                  {getButtonText(plan.id)}
                </Button>
                
                {isCurrent && limits && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Used {limits.appointments_used} of {limits.appointments_limit} appointments this month
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {user && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Cancel or change your subscription anytime. No long-term commitment.
          </p>
        </div>
      )}
    </div>
  );
};

export default PricingPlans;