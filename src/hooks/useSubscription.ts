import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionLimits {
  can_create_appointment: boolean;
  appointments_used: number;
  appointments_limit: number;
  subscription_tier: string;
}

interface SubscriptionInfo {
  id: string;
  user_id: string;
  subscription_tier: string;
  subscribed: boolean;
  monthly_appointments_used: number;
  monthly_limit: number;
  billing_period_start: string;
  billing_period_end: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo();
      fetchSubscriptionLimits();
    }
  }, [user]);

  const fetchSubscriptionInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription info:', error);
        return;
      }

      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Error in fetchSubscriptionInfo:', error);
    }
  };

  const fetchSubscriptionLimits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_subscription_limits', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching subscription limits:', error);
        return;
      }

      if (data && data.length > 0) {
        setLimits(data[0]);
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionLimits:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreateAppointment = (): boolean => {
    if (!limits) return false;
    
    const canCreate = limits.can_create_appointment;
    
    if (!canCreate) {
      toast({
        title: "הגעת לגבול המנוי",
        description: `הגעת לגבול של ${limits.appointments_limit} תורים לחודש. שדרג את המנוי שלך לתורים נוספים.`,
        variant: "destructive"
      });
    }
    
    return canCreate;
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('increment_appointment_usage', { p_user_id: user.id });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      // Refresh limits after incrementing
      await fetchSubscriptionLimits();
      await fetchSubscriptionInfo();

      return data;
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  };

  const getSubscriptionTierLabel = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'חינמי';
      case 'premium':
        return 'פרימיום';
      case 'business':
        return 'עסקי';
      default:
        return tier;
    }
  };

  const getSubscriptionTierLimits = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          appointments: 10,
          price: 0,
          features: ['10 תורים לחודש', 'ניהול לקוחות בסיסי', 'יומן פשוט']
        };
      case 'premium':
        return {
          appointments: 100,
          price: 19.90,
          features: ['100 תורים לחודש', 'ניהול לקוחות מתקדם', 'יומן מלא', 'תזכורות SMS']
        };
      case 'business':
        return {
          appointments: 1000,
          price: 49.90,
          features: ['1000 תורים לחודש', 'כל התכונות', 'דוחות מתקדמים', 'API גישה', 'תמיכה מועדפת']
        };
      default:
        return {
          appointments: 0,
          price: 0,
          features: []
        };
    }
  };

  const createCheckoutSession = async (plan: 'premium' | 'business') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "שגיאה ביצירת תשלום",
        description: "לא ניתן ליצור סשן תשלום. נסה שוב.",
        variant: "destructive"
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "שגיאה בפתיחת ניהול מנוי",
        description: "לא ניתן לפתוח את דף ניהול המנוי. נסה שוב.",
        variant: "destructive"
      });
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      // Refresh local state after checking subscription
      await fetchSubscriptionInfo();
      await fetchSubscriptionLimits();

      toast({
        title: "מצב המנוי עודכן",
        description: "מידע המנוי נטען מחדש בהצלחה",
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
      toast({
        title: "שגיאה בבדיקת מנוי",
        description: "לא ניתן לבדוק את מצב המנוי. נסה שוב.",
        variant: "destructive"
      });
    }
  };

  return {
    subscriptionInfo,
    limits,
    loading,
    checkCanCreateAppointment,
    incrementUsage,
    getSubscriptionTierLabel,
    getSubscriptionTierLimits,
    createCheckoutSession,
    openCustomerPortal,
    checkSubscriptionStatus,
    refreshLimits: fetchSubscriptionLimits,
    refreshSubscriptionInfo: fetchSubscriptionInfo
  };
};