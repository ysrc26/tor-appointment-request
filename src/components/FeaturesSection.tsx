import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  Shield, 
  Smartphone, 
  Clock, 
  UserCheck,
  Link2,
  Settings
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Link2,
      title: "Custom Business Page",
      description: "Get your unique link (mytor.app/yourname) that customers can easily access and bookmark."
    },
    {
      icon: MessageSquare,
      title: "SMS Verification", 
      description: "Built-in OTP verification ensures legitimate requests and reduces no-shows."
    },
    {
      icon: UserCheck,
      title: "Manual Approval",
      description: "You stay in control - approve or decline every appointment request personally."
    },
    {
      icon: Calendar,
      title: "Availability Management",
      description: "Set your working hours and block dates for holidays or vacations easily."
    },
    {
      icon: Clock,
      title: "Service Duration Control",
      description: "Define different services with custom durations, prices, and descriptions."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Works perfectly on any device - no app installation required for you or your clients."
    },
    {
      icon: Shield,
      title: "Client Management",
      description: "Track returning customers and their appointment history automatically."
    },
    {
      icon: Settings,
      title: "Simple Setup",
      description: "Get started in 5 minutes - no technical knowledge required."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need, 
            <span className="block text-primary">Nothing You Don't</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Designed specifically for small business owners who want simple, 
            effective appointment management without the complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Process flow */}
        <div className="mt-20">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Send Your Link",
                description: "Share your MyTor link with customers via WhatsApp, SMS, or social media."
              },
              {
                step: "2", 
                title: "Receive Requests",
                description: "Customers pick available times and send appointment requests with SMS verification."
              },
              {
                step: "3",
                title: "Approve & Confirm",
                description: "Review requests and click approve or decline. Customers get instant SMS confirmation."
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-white text-xl font-bold">{step.step}</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h4>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;