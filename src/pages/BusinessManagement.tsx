import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Settings, Clock, Users, ArrowLeft, ExternalLink } from 'lucide-react';

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

const BusinessManagement = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { businessId } = useParams();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBusiness();
  }, [user, businessId]);

  const fetchBusiness = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('user_id', userProfile.id)
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את פרטי העסק",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setBusiness(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      navigate('/dashboard');
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

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              חזרה לדשבורד
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">{business.name}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`/${business.slug}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            הדף הציבורי
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ניהול העסק
          </h1>
          <p className="text-muted-foreground">
            נהל את השירותים, שעות הפעילות והגדרות העסק שלך
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="services">השירותים</TabsTrigger>
            <TabsTrigger value="availability">שעות פעילות</TabsTrigger>
            <TabsTrigger value="settings">הגדרות</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">תורים השבוע</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 מהשבוע הקודם
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">שירותים פעילים</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    סך הכל שירותים זמינים
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">זמן ממוצע</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45 ד'</div>
                  <p className="text-xs text-muted-foreground">
                    משך שירות ממוצע
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>פעולות מהירות</CardTitle>
                <CardDescription>
                  נהל את העסק שלך בקלות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-right">
                      <div className="font-medium">הוסף שירות חדש</div>
                      <div className="text-sm text-muted-foreground">הגדר שירות חדש עם מחיר ומשך זמן</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-right">
                      <div className="font-medium">עדכן שעות פעילות</div>
                      <div className="text-sm text-muted-foreground">קבע מתי אתה זמין לקבלת תורים</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-right">
                      <div className="font-medium">צפה בתורים</div>
                      <div className="text-sm text-muted-foreground">ראה ונהל את כל התורים שלך</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-right">
                      <div className="font-medium">עדכן פרטי עסק</div>
                      <div className="text-sm text-muted-foreground">שנה תיאור, טלפון וכתובת</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>השירותים שלי</CardTitle>
                <CardDescription>
                  נהל את השירותים שאתה מציע
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">אין שירותים עדיין</h3>
                  <p className="text-muted-foreground mb-4">
                    הוסף את השירות הראשון שלך כדי שלקוחות יוכלו לקבוע תורים
                  </p>
                  <Button>הוסף שירות ראשון</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>שעות פעילות</CardTitle>
                <CardDescription>
                  הגדר מתי אתה זמין לקבלת תורים
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">לא הוגדרו שעות פעילות</h3>
                  <p className="text-muted-foreground mb-4">
                    הגדר את שעות הפעילות שלך בכל יום בשבוע
                  </p>
                  <Button>הגדר שעות פעילות</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות העסק</CardTitle>
                <CardDescription>
                  נהל את הגדרות העסק שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">פרטי העסק</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>שם:</strong> {business.name}</p>
                      <p><strong>כתובת ציבורית:</strong> mytor.app/{business.slug}</p>
                      {business.phone && <p><strong>טלפון:</strong> {business.phone}</p>}
                      {business.address && <p><strong>כתובת:</strong> {business.address}</p>}
                    </div>
                    <Button variant="outline" size="sm">ערוך פרטים</Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">סטטוס העסק</h4>
                    <p className="text-sm text-muted-foreground">
                      העסק {business.is_active ? 'פעיל' : 'לא פעיל'} ו{business.is_active ? 'זמין' : 'לא זמין'} לקבלת תורים
                    </p>
                    <Button variant="outline" size="sm">
                      {business.is_active ? 'השבת עסק' : 'הפעל עסק'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessManagement;