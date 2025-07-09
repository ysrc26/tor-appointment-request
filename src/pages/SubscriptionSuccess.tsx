import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const { checkSubscriptionStatus } = useSubscription();

  useEffect(() => {
    // Check subscription status when page loads
    const timer = setTimeout(() => {
      checkSubscriptionStatus();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscriptionStatus]);

  const getPlanDetails = (planType: string | null) => {
    switch (planType) {
      case 'premium':
        return {
          name: 'Premium',
          icon: Crown,
          features: ['100 appointments per month', 'Advanced client management', 'Full calendar', 'SMS reminders'],
          price: '₪19.90'
        };
      case 'business':
        return {
          name: 'Business',
          icon: Zap,
          features: ['1000 appointments per month', 'All features', 'Advanced reports', 'API access'],
          price: '₪49.90'
        };
      default:
        return {
          name: 'Your Subscription',
          icon: CheckCircle,
          features: ['Full access to all features'],
          price: ''
        };
    }
  };

  const planDetails = getPlanDetails(plan);
  const Icon = planDetails.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-foreground">
            Payment Completed Successfully!
          </CardTitle>
          <CardDescription>
            Welcome to your {planDetails.name} subscription
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
              What you get:
            </h3>
            <ul className="space-y-1">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <CheckCircle className="w-3 h-3 ml-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {planDetails.price && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Monthly billing: <span className="font-medium">{planDetails.price}</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You can manage your subscription anytime from the dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;