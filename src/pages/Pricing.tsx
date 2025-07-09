import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import PricingPlans from '@/components/PricingPlans';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Transparent and Flexible Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your needs. Start free and upgrade only when you're ready.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Start Today
          </Button>
        </div>

        <PricingPlans />

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Is there a commitment?</h3>
              <p className="text-muted-foreground text-sm">
                No, there's no commitment. You can cancel or change your subscription anytime.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">What happens if I exceed my appointment limit?</h3>
              <p className="text-muted-foreground text-sm">
                The system will prevent creating additional appointments. You can upgrade anytime.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">How do I change plans?</h3>
              <p className="text-muted-foreground text-sm">
                You can upgrade or downgrade your subscription anytime from the dashboard.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">How does billing work?</h3>
              <p className="text-muted-foreground text-sm">
                Billing is processed monthly through Stripe securely.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;