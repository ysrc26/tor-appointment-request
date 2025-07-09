import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, referralCode?: string) => Promise<{ error: any }>;
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

  const signUp = async (email: string, password: string, fullName: string, phone: string, referralCode?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
            referral_code: referralCode
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message === 'User already registered' 
            ? "User is already registered in the system" 
            : "An error occurred during registration. Please try again.",
          variant: "destructive"
        });
      } else {
        // If referral code was provided and user was created, process the referral
        if (referralCode && data.user) {
          try {
            // Get IP address for fraud prevention
            const ipAddress = await fetch('https://api64.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip)
              .catch(() => null);

            // Wait a bit for the user to be fully created in the database
            setTimeout(async () => {
              const { data: referralResult, error: referralError } = await supabase
                .rpc('process_referral_signup', {
                  p_referred_user_id: data.user.id,
                  p_referral_code: referralCode,
                  p_ip_address: ipAddress
                });

              if (referralError) {
                console.error('Error processing referral:', referralError);
              } else if (referralResult) {
                console.log('Referral processed:', referralResult);
              }
            }, 2000);
          } catch (referralError) {
            console.error('Error processing referral:', referralError);
          }
        }

        toast({
          title: "Registered Successfully!",
          description: referralCode 
            ? "Check your email to confirm your account. You'll receive a Premium month free as a welcome bonus!"
            : "Check your email to confirm your account",
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
          title: "Login Error",
          description: error.message === 'Invalid login credentials'
            ? "Invalid login credentials"
            : "A login error occurred. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Logged In Successfully!",
          description: "Welcome to MyTor",
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
          title: "Logout Error",
          description: "An error occurred while logging out",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Logged Out",
          description: "Goodbye!",
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
          title: "Profile Update Error",
          description: "An error occurred while updating the profile",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Profile Updated Successfully",
          description: "Changes have been saved",
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