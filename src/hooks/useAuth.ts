import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile after auth state change
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) {
        toast({
          title: "שגיאה ברישום",
          description: error.message === 'User already registered' 
            ? "המשתמש כבר רשום במערכת" 
            : "אירעה שגיאה בהרשמה. נסה שוב.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "נרשמת בהצלחה!",
          description: "בדוק את האימייל שלך לאישור החשבון",
        });
      }

      return { error };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "שגיאה בהתחברות",
          description: error.message === 'Invalid login credentials'
            ? "פרטי התחברות שגויים"
            : "אירעה שגיאה בהתחברות. נסה שוב.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "התחברת בהצלחה!",
          description: "ברוך הבא ל-MyTor",
        });
      }

      return { error };
    } catch (error) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "שגיאה ביציאה",
          description: "אירעה שגיאה ביציאה מהמערכת",
          variant: "destructive"
        });
      } else {
        toast({
          title: "יצאת מהמערכת",
          description: "להתראות!",
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('auth_user_id', user.id);

      if (error) {
        toast({
          title: "שגיאה בעדכון פרופיל",
          description: "אירעה שגיאה בעדכון הפרופיל",
          variant: "destructive"
        });
      } else {
        toast({
          title: "הפרופיל עודכן בהצלחה",
          description: "השינויים נשמרו",
        });
        // Refresh user profile
        fetchUserProfile(user.id);
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
};

export { AuthContext };