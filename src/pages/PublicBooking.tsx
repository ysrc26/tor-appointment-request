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
          <p className="text-muted-foreground">טוען...</p>
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
          <h1 className="text-2xl font-bold text-foreground mb-2">העסק לא נמצא</h1>
          <p className="text-muted-foreground mb-4">
            העסק שחיפשת לא קיים או לא פעיל כרגע
          </p>
          <Button onClick={() => window.location.href = '/'}>
            חזרה לעמוד הבית
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Business Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">
              {business.name.charAt(0)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {business.name}
          </h1>
          {business.description && (
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              {business.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {business.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{business.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">השירותים שלנו</h2>
          
          {services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">אין שירותים זמינים כרגע</h3>
                <p className="text-muted-foreground">
                  העסק עדיין מגדיר את השירותים. אנא נסה שוב מאוחר יותר.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service) => (
                <Card key={service.id} className="border-border/50 hover:shadow-large transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-right">{service.name}</CardTitle>
                        {service.description && (
                          <CardDescription className="text-right mt-2">
                            {service.description}
                          </CardDescription>
                        )}
                      </div>
                      {service.price && (
                        <Badge variant="secondary" className="mr-2">
                          ₪{service.price}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration_minutes} דקות</span>
                      </div>
                      <Button className="mr-2">
                        קבע תור
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Terms Section */}
        {business.terms && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>תנאי התורים</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {business.terms}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>יצירת קשר</CardTitle>
            <CardDescription>
              שאלות? רוצה לקבוע תור בטלפון? נשמח לעזור
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {business.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">טלפון</p>
                    <p className="text-muted-foreground">{business.phone}</p>
                  </div>
                </div>
              )}
              
              {business.address && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">כתובת</p>
                    <p className="text-muted-foreground">{business.address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicBooking;