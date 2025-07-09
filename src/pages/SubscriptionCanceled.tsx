import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';

const SubscriptionCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-foreground">
            Payment Canceled
          </CardTitle>
          <CardDescription>
            Payment was canceled and no charge was made
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              No worries! No charge was made. You can try again anytime or continue with the free plan.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(-1)}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              Try Again
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You can upgrade your subscription anytime from the dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCanceled;