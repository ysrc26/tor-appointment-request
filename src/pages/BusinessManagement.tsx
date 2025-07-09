import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Settings, Clock, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import ServicesManagement from '@/components/ServicesManagement';
import AvailabilityManagement from '@/components/AvailabilityManagement';
import BusinessSettings from '@/components/BusinessSettings';
import AppointmentsManagement from '@/components/AppointmentsManagement';

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
  const [activeTab, setActiveTab] = useState('overview');
  const { businessId } = useParams();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set active tab based on URL path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/appointments')) {
      setActiveTab('appointments');
    } else if (path.includes('/clients')) {
      setActiveTab('clients');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, []);

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
          title: "Error",
          description: "Unable to load business details",
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
          <p className="text-muted-foreground">Loading...</p>
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
            <ExternalLink className="w-4 h-4 mr-2" />
            Public Page
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Manage your services, availability, and business settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Total available services
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45 min</div>
                  <p className="text-xs text-muted-foreground">
                    Average service duration
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your business easily
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('services')}>
                    <div className="text-left">
                      <div className="font-medium">Add New Service</div>
                      <div className="text-sm text-muted-foreground">Set up a new service with price and duration</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('availability')}>
                    <div className="text-left">
                      <div className="font-medium">Update Availability</div>
                      <div className="text-sm text-muted-foreground">Set when you're available for appointments</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('appointments')}>
                    <div className="text-left">
                      <div className="font-medium">View Appointments</div>
                      <div className="text-sm text-muted-foreground">See and manage all your appointments</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('settings')}>
                    <div className="text-left">
                      <div className="font-medium">Update Business Details</div>
                      <div className="text-sm text-muted-foreground">Change description, phone, and address</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsManagement businessId={businessId!} userId={userProfile!.id} />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement businessId={businessId!} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManagement businessId={businessId!} userId={userProfile!.id} />
          </TabsContent>

          <TabsContent value="settings">
            <BusinessSettings 
              business={business} 
              onBusinessUpdate={(updatedBusiness) => setBusiness(updatedBusiness)} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessManagement;