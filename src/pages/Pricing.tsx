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
            מחירים שקופים וגמישים
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            בחר בתוכנית המתאימה לצרכים שלך. התחל חינם ושדרג רק כשאתה מוכן.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
          >
            התחל היום
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </div>

        <PricingPlans />

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            שאלות נפוצות
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-foreground mb-2">האם יש התחייבות?</h3>
              <p className="text-muted-foreground text-sm">
                לא, אין התחייבות. ניתן לבטל או לשנות מנוי בכל עת.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">מה קרה אם אחרוג מכמות התורים?</h3>
              <p className="text-muted-foreground text-sm">
                המערכת תמנע יצירת תורים נוספים. תוכל לשדרג מנוי בכל עת.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">איך אני משנה תוכנית?</h3>
              <p className="text-muted-foreground text-sm">
                ניתן לשדרג או להוריד דרגת מנוי בכל עת מהדשבורד.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">איך מתבצע החיוב?</h3>
              <p className="text-muted-foreground text-sm">
                החיוב מתבצע מדי חודש דרך Stripe באופן מאובטח.
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