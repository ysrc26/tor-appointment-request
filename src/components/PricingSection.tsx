import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Star, Crown } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "₪0",
      period: "forever",
      description: "Perfect for trying out MyTor",
      features: [
        "Up to 10 appointments/month",
        "Basic SMS notifications", 
        "Custom business page",
        "Manual approval system",
        "Mobile optimized"
      ],
      limitations: [
        "MyTor branding included",
        "Basic support only"
      ],
      cta: "Start Free",
      variant: "outline" as const,
      popular: false
    },
    {
      name: "Personal Premium",
      price: "₪9.90",
      period: "per month",
      description: "Best for individual practitioners",
      features: [
        "Up to 100 appointments/month",
        "Remove MyTor branding",
        "Priority SMS notifications",
        "Customer history tracking",
        "Custom service descriptions",
        "Holiday blocking",
        "Priority support"
      ],
      limitations: [],
      cta: "Start Trial",
      variant: "hero" as const,
      popular: true
    },
    {
      name: "Business",
      price: "₪49",
      period: "per month", 
      description: "For clinics with multiple therapists",
      features: [
        "Unlimited appointments",
        "Multiple staff members",
        "Advanced analytics",
        "WhatsApp integration",
        "Custom domain option",
        "Advanced calendar sync",
        "Dedicated support",
        "Payment integration"
      ],
      limitations: [],
      cta: "Contact Sales",
      variant: "premium" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees, no surprises.
            Perfect for Israeli small businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative p-8 ${
                plan.popular 
                  ? 'border-2 border-primary shadow-large scale-105' 
                  : 'border border-border shadow-soft hover:shadow-medium'
              } transition-all duration-300 hover:scale-[1.02] bg-gradient-card`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-hero text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {plan.name === "Business" && (
                <div className="absolute top-6 right-6">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-start gap-3 opacity-60">
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground mt-0.5 flex-shrink-0"></div>
                    <span className="text-muted-foreground text-sm">{limitation}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.variant} 
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>

              {plan.name === "Personal Premium" && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  7-day free trial • Cancel anytime
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* FAQ or additional info */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            All plans include SMS verification, mobile optimization, and basic support.
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom solution? <span className="text-primary font-medium cursor-pointer hover:underline">Contact our team</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;