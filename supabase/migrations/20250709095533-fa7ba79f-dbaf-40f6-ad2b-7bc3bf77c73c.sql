-- Add subscription_tier field to users table
ALTER TABLE public.users 
ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free' 
CHECK (subscription_tier IN ('free', 'premium', 'business'));

-- Create function to automatically create subscriber record when user signs up
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
  
  -- Create corresponding subscriber record
  INSERT INTO public.subscribers (user_id, email, subscription_tier, subscribed)
  VALUES (NEW.id, NEW.email, 'free', false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;