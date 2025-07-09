import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-3 sm:px-4 pt-20 pb-12 sm:pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/50 backdrop-blur-sm border border-primary/20 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6 animate-fade-in">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-xs sm:text-sm font-medium text-accent-foreground">
              Perfect for Israeli small businesses
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-in leading-tight">
            Ultra-Simple
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Appointment Booking
            </span>
            for Small Businesses
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in px-2">
            Send a link → receive requests → approve manually. 
            No complex systems, no self-booking. Just simple appointment management 
            designed for beauticians, tutors, and therapists.
          </p>

          {/* Benefits list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:flex lg:flex-wrap lg:justify-center lg:gap-6 mb-8 sm:mb-10 animate-fade-in max-w-2xl mx-auto">
            {[
              "SMS verification included",
              "Manual approval control", 
              "No app installation needed",
              "Hebrew interface ready"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0" />
                <span className="text-sm sm:text-base text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 animate-scale-in px-4">
            <Button variant="hero" size="lg" className="group w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="premium" size="lg" className="group w-full sm:w-auto">
              <Play className="w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Social proof */}
          <div className="text-center animate-fade-in">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Trusted by 500+ Israeli small businesses
            </p>
            <div className="flex justify-center items-center gap-4 sm:gap-8 opacity-60">
              {/* Placeholder for business logos/testimonials */}
              <div className="flex -space-x-1 sm:-space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div 
                    key={i} 
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-hero rounded-full border-2 border-background"
                  ></div>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-medium">+495 more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;