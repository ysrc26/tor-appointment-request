import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserLanguage = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  // Load user's preferred language from database
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('preferred_language')
            .eq('auth_user_id', user.id)
            .single();

          if (data && data.preferred_language && data.preferred_language !== i18n.language) {
            i18n.changeLanguage(data.preferred_language);
            // Update document direction for RTL support
            document.documentElement.dir = data.preferred_language === 'he' ? 'rtl' : 'ltr';
            document.documentElement.lang = data.preferred_language;
          }
        } catch (error) {
          console.error('Error loading user language preference:', error);
        }
      }
    };

    loadUserLanguage();
  }, [user, i18n]);

  // Save language preference to database when changed
  const saveLanguagePreference = async (language: string) => {
    if (user) {
      try {
        await supabase
          .from('users')
          .update({ preferred_language: language })
          .eq('auth_user_id', user.id);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  return {
    saveLanguagePreference,
  };
};