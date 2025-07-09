import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, Phone, Star, ArrowRight } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  terms: string | null;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number;
  is_active: boolean;
}

const PublicBooking = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      fetchBusinessData();
    }
  }, [slug]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (businessError) {
        console.error('Error fetching business:', businessError);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setBusiness(businessData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData || []);
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Business Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The business you're looking for doesn't exist or is not currently active
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">MyTor</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Demo Business Page */}
          <Card className="p-6 bg-gradient-card shadow-large border-0">
            {/* Business Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {business.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {business.name}
              </h3>
              {business.description && (
                <p className="text-muted-foreground mb-4">
                  {business.description}
                </p>
              )}
              
              {/* Business Info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                {business.address && (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Services Available</h4>
                <p className="text-muted-foreground text-sm">
                  The business is still setting up services. Please try again later.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-foreground">Available Services:</h4>
                  {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <div>
                        <span className="font-medium text-foreground">{service.name}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{service.duration_minutes} minutes</span>
                        </div>
                      </div>
                      {service.price && (
                        <span className="font-semibold text-primary">${service.price}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Available Times Preview */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Weekly Availability:</h4>
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
              </>
            )}

            {/* Terms Section */}
            {business.terms && (
              <div className="mt-6 pt-6 border-t border-border/30">
                <h4 className="font-semibold text-foreground mb-2">Appointment Terms</h4>
                <p className="text-xs text-muted-foreground">
                  {business.terms}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;