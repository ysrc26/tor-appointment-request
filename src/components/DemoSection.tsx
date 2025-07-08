import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Phone, User } from "lucide-react";

const DemoSection = () => {
  return (
    <section id="demo" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            See MyTor in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            This is how your business page will look to customers. 
            Clean, simple, and professional.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Demo Business Page */}
          <Card className="p-6 bg-gradient-card shadow-large border-0">
            {/* Business Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Sarah's Beauty Studio
              </h3>
              <p className="text-muted-foreground mb-4">
                Professional nail care and beauty treatments
              </p>
              
              {/* Business Info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Tel Aviv, Israel</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>052-123-4567</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-foreground">Available Services:</h4>
              {[
                { name: "Classic Manicure", duration: "45 min", price: "₪80" },
                { name: "Gel Polish", duration: "60 min", price: "₪120" },
                { name: "Pedicure", duration: "60 min", price: "₪100" }
              ].map((service, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <div>
                    <span className="font-medium text-foreground">{service.name}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{service.price}</span>
                </div>
              ))}
            </div>

            {/* Available Times Preview */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-3">Available This Week:</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "10:00", "11:30", "14:00", 
                  "15:30", "17:00", "18:30"
                ].map((time, index) => (
                  <button 
                    key={index}
                    className="p-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button variant="hero" className="w-full mb-4">
              <Calendar className="w-4 h-4" />
              Request Appointment
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              SMS verification required • Response within 2 hours
            </p>
          </Card>

          {/* Demo Controls */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              This is a live demo - try clicking around!
            </p>
            <Button variant="premium" size="lg">
              Create Your Own Page
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            {
              title: "Professional Appearance",
              description: "Your business looks trustworthy and established with a clean, modern design."
            },
            {
              title: "Mobile-First Design", 
              description: "Customers can easily book from their phones - the most common way they'll find you."
            },
            {
              title: "You Stay in Control",
              description: "Every appointment request requires your approval. No surprise bookings or conflicts."
            }
          ].map((benefit, index) => (
            <Card key={index} className="p-6 text-center bg-gradient-card border-0 shadow-soft">
              <h4 className="font-semibold text-foreground mb-2">
                {benefit.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DemoSection;