import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Settings, LogOut, Plus, Store, ExternalLink, Crown } from 'lucide-react';
import PricingPlans from '@/components/PricingPlans';
import AffiliateSection from '@/components/AffiliateSection';

const Dashboard = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const { 
    limits, 
    subscriptionInfo, 
    loading: subscriptionLoading, 
    getSubscriptionTierLabel 
  } = useSubscription();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch businesses when user profile is available
  useEffect(() => {
    if (userProfile?.id) {
      fetchBusinesses();
    }
  }, [userProfile]);

  const fetchBusinesses = async () => {
    if (!userProfile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
      } else {
        setBusinesses(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching businesses:', error);
    }
    
    setBusinessesLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">MyTor</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden md:block max-w-32 sm:max-w-none truncate">
              Hello, {userProfile?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your business, appointments, and clients in one place
          </p>
        </div>

        {/* Subscription Status */}
        {limits && (
          <Card className="border-border/50 bg-muted/30 mb-6 sm:mb-8">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base">{getSubscriptionTierLabel(limits.subscription_tier)} Subscription</span>
                      <Badge variant="outline" className="text-xs w-fit">
                        {limits.appointments_used}/{limits.appointments_limit} appointments
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {limits.appointments_limit - limits.appointments_used} remaining this month
                    </p>
                  </div>
                </div>
                {limits.subscription_tier === 'free' && (
                  <Button variant="hero" size="sm" onClick={() => navigate('/pricing')} className="text-xs sm:text-sm">
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Businesses Section */}
        {!businessesLoading && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">My Businesses</h2>
              <Button 
                onClick={() => navigate('/business/setup')}
                variant="hero"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Business
              </Button>
            </div>

            {businesses.length === 0 ? (
              <Card className="border-border/50 border-dashed">
                <CardContent className="text-center py-12">
                  <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    You don't have any businesses yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Let's start by creating your first business in the MyTor system
                  </p>
                  <Button 
                    onClick={() => navigate('/business/setup')}
                    variant="hero"
                    size="lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Business
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                  <Card key={business.id} className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg mb-1 truncate">{business.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">mytor.app/{business.slug}</span>
                          </CardDescription>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${business.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {business.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}`)}
                        >
                          <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Manage</span>
                          <span className="sm:hidden">Mgmt</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/${business.slug}`, '_blank')}
                          className="px-2 sm:px-3"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions - Only show if user has businesses */}
        {businesses.length > 0 && (
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
            <Card className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Appointments</CardTitle>
                    <CardDescription>View and manage existing appointments</CardDescription>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => businesses.length > 0 && navigate(`/business/${businesses[0].id}/appointments`)}
                  disabled={businesses.length === 0}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Appointments
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Clients</CardTitle>
                    <CardDescription>Manage your client list</CardDescription>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/clients')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Clients
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Manage settings and services</CardDescription>
                  </div>
                  <Settings className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => businesses.length > 0 && navigate(`/business/${businesses[0].id}/settings`)}
                  disabled={businesses.length === 0}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Business Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Affiliate Program Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Affiliate Program</h2>
          <AffiliateSection />
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Today's Appointments</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">This Week</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Clients</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Services</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans for Free Users */}
        {limits && limits.subscription_tier === 'free' && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Upgrade Your Subscription
              </h2>
              <p className="text-muted-foreground">
                Get more appointments and advanced features
              </p>
            </div>
            <PricingPlans showTitle={false} compact={true} />
          </div>
        )}

        {/* Recent Activity */}
        <Card className="border-border/50 mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Appointments and activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;