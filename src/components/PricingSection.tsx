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
    <section id="pricing" className="py-12 sm:py-20">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Start free and upgrade when you're ready. No hidden fees, no surprises.
            Perfect for Israeli small businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative p-4 sm:p-6 lg:p-8 ${
                plan.popular 
                  ? 'border-2 border-primary shadow-large sm:scale-105' 
                  : 'border border-border shadow-soft hover:shadow-medium'
              } transition-all duration-300 hover:scale-[1.02] bg-gradient-card`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-hero text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {plan.name === "Business" && (
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-1 sm:ml-2 text-sm sm:text-base">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-start gap-2 sm:gap-3 opacity-60">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-muted-foreground mt-0.5 flex-shrink-0"></div>
                    <span className="text-muted-foreground text-xs sm:text-sm">{limitation}</span>
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
                <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
                  7-day free trial • Cancel anytime
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* FAQ or additional info */}
        <div className="text-center mt-12 sm:mt-16 px-4">
          <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
            All plans include SMS verification, mobile optimization, and basic support.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Need a custom solution? <span className="text-primary font-medium cursor-pointer hover:underline">Contact our team</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;