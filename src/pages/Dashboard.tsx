import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Settings, LogOut, Plus, Store } from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">MyTor</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              שלום, {userProfile?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ברוך הבא לדשבורד שלך
          </h1>
          <p className="text-muted-foreground">
            נהל את העסק שלך, תורים ולקוחות במקום אחד
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">העסק שלי</CardTitle>
                  <CardDescription>הגדר ונהל את פרטי העסק</CardDescription>
                </div>
                <Store className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                הגדר עסק חדש
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">תורים</CardTitle>
                  <CardDescription>צפה ונהל תורים קיימים</CardDescription>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                צפה בתורים
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-medium transition-all duration-200 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">לקוחות</CardTitle>
                  <CardDescription>נהל את רשימת הלקוחות</CardDescription>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                צפה בלקוחות
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">תורים היום</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">תורים השבוע</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">לקוחות</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">שירותים</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
            <CardDescription>עדכונים אחרונים מהעסק שלך</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין פעילות אחרונה להצגה</p>
              <p className="text-sm">תורים ופעילות יופיעו כאן</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;