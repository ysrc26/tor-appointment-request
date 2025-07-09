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
      .replace(/[^\u0590-\u05FFa-z0-9\s]/g, '') // Keep Hebrew, English, numbers, spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .slice(0, 50); // Limit length
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) {
      toast({
        title: "שגיאה",
        description: "לא נמצא פרופיל משתמש",
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
          title: "כתובת תפוסה",
          description: "הכתובת הזו כבר תפוסה, אנא בחר שם אחר לעסק",
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
          title: "שגיאה ביצירת העסק",
          description: "אירעה שגיאה ביצירת העסק. נסה שוב.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "העסק נוצר בהצלחה!",
          description: `העסק ${formData.name} נוצר והוא זמין בכתובת mytor.app/${formData.slug}`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה לא צפויה",
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
            חזרה לדשבורד
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            בואו נגדיר את העסק שלך
          </h1>
          <p className="text-muted-foreground">
            מלא את הפרטים הבסיסיים כדי ליצור את הדף הציבורי של העסק
          </p>
        </div>

        <Card className="border-border/50 shadow-large">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              פרטי העסק
            </CardTitle>
            <CardDescription>
              המידע הזה יוצג בדף הציבורי של העסק שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="name">שם העסק *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="לדוגמה: סלון יופי רחל"
                  required
                />
              </div>

              {/* Slug Preview */}
              <div className="space-y-2">
                <Label htmlFor="slug">כתובת הדף הציבורי</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">mytor.app/</span>
                  <span className="font-medium text-foreground">
                    {formData.slug || 'your-business-name'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  הכתובת נוצרת אוטומטית מהשם של העסק
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">תיאור העסק</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="תאר את העסק שלך, השירותים שאתה מציע והניסיון שלך..."
                  rows={4}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון עסק</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="050-1234567"
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">כתובת העסק</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="רחוב דוגמה 123, תל אביב"
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms">תנאי התורים (אופציונלי)</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="לדוגמה: ביטול עד 24 שעות לפני התור, דמי ביטול 50 ש״ח..."
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
                {isLoading ? 'יוצר עסק...' : 'צור עסק'}
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSetup;