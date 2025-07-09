-- Update the handle_new_user function to also create a subscriber record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name, phone, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'free'
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Create corresponding subscriber record with default free tier
  INSERT INTO public.subscribers (user_id, email, subscription_tier, subscribed, monthly_limit)
  VALUES (NEW.id, NEW.email, 'free', false, 10);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;