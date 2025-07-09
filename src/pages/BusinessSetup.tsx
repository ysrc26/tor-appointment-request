import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, ArrowRight, Store, Globe, Phone, MapPin } from 'lucide-react';

const BusinessSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    phone: '',
    address: '',
    terms: '',
    payment_link: ''
  });
  
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Generate slug from business name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Keep English, numbers, spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .slice(0, 50); // Limit length
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-generate slug if it's empty or the user hasn't manually edited it
      slug: prev.slug === generateSlug(prev.name) || prev.slug === '' ? generateSlug(name) : prev.slug
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Only English letters, numbers, and hyphens
      .slice(0, 50);
    setFormData(prev => ({
      ...prev,
      slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if slug already exists
      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existingBusiness) {
        toast({
          title: "Address Taken",
          description: "This address is already taken, please choose a different business name",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create the business
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          user_id: userProfile.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          phone: formData.phone || null,
          address: formData.address || null,
          terms: formData.terms || null,
          payment_link: formData.payment_link || null
        })
        .select()
        .single();

      if (error) {
        console.error('Business creation error:', error);
        toast({
          title: "Business Creation Error",
          description: "An error occurred while creating the business. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Business Created Successfully!",
          description: `Business ${formData.name} has been created and is available at mytor.app/${formData.slug}`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  if (!user) {
    return null;
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
          
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Let's Set Up Your Business
          </h1>
          <p className="text-muted-foreground">
            Fill in the basic details to create your business public page
          </p>
        </div>

        <Card className="border-border/50 shadow-large">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Business Details
            </CardTitle>
            <CardDescription>
              This information will be displayed on your business public page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Rachel's Beauty Salon"
                  required
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-2">
                <Label htmlFor="slug">Public Page Address *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">mytor.app/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="my-business"
                    required
                    className="flex-1"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only English letters, numbers, and hyphens. This address will be publicly available for booking appointments
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business, the services you offer, and your experience..."
                  rows={4}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="050-1234567"
                    className="pl-10"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Example Street, Tel Aviv"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms">Appointment Terms (Optional)</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="e.g., Cancellation up to 24 hours before appointment, 50 NIS cancellation fee..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !formData.name.trim()}
                variant="hero"
                size="lg"
              >
                {isLoading ? 'Creating Business...' : 'Create Business'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSetup;