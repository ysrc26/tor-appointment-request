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
            תשלום בוטל
          </CardTitle>
          <CardDescription>
            התשלום בוטל ולא בוצע חיוב
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              אין דאגה! לא בוצע שום חיוב. תוכל לנסות שוב בכל עת או להמשיך עם המנוי החינמי.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              חזור לדשבורד
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(-1)}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              נסה שוב
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              ניתן לשדרג מנוי בכל עת מהדשבורד
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCanceled;