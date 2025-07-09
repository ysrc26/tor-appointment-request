-- Create users table with proper auth integration
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  profile_pic text,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id)
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  profile_pic text,
  terms text,
  payment_link text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  phone text,
  address text,
  profile_image_url text,
  profile_image_path text,
  profile_image_updated_at timestamp with time zone,
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_id uuid,
  service_id uuid,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  note text,
  client_verified boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'declined'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT appointments_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL,
  CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL
);

-- Create availability table
CREATE TABLE IF NOT EXISTS public.availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_id uuid,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT availability_pkey PRIMARY KEY (id),
  CONSTRAINT availability_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT availability_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Create unavailable_dates table
CREATE TABLE IF NOT EXISTS public.unavailable_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_id uuid,
  date date NOT NULL,
  tag text,
  description text,
  CONSTRAINT unavailable_dates_pkey PRIMARY KEY (id),
  CONSTRAINT unavailable_dates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT unavailable_dates_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  notes text,
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  method text NOT NULL CHECK (method = ANY (ARRAY['sms'::text, 'call'::text])),
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT otp_verifications_pkey PRIMARY KEY (id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  default_calendar_view text NOT NULL DEFAULT 'work-days'::text CHECK (default_calendar_view = ANY (ARRAY['day'::text, 'week'::text, 'work-days'::text, 'month'::text, 'agenda'::text])),
  booking_advance_limit text NOT NULL DEFAULT 'week'::text CHECK (booking_advance_limit = ANY (ARRAY['week'::text, 'two-weeks'::text, 'month'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unavailable_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Create RLS Policies for businesses table
CREATE POLICY "Users can view their own businesses" ON public.businesses
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage their own businesses" ON public.businesses
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Anyone can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);

-- Create RLS Policies for services table
CREATE POLICY "Users can manage their business services" ON public.services
  FOR ALL USING (business_id IN (
    SELECT b.id FROM public.businesses b 
    JOIN public.users u ON b.user_id = u.id 
    WHERE u.auth_user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Create RLS Policies for appointments table
CREATE POLICY "Users can manage their appointments" ON public.appointments
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Create RLS Policies for availability table
CREATE POLICY "Users can manage their availability" ON public.availability
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Anyone can view availability" ON public.availability
  FOR SELECT USING (is_active = true);

-- Create RLS Policies for unavailable_dates table
CREATE POLICY "Users can manage their unavailable dates" ON public.unavailable_dates
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Create RLS Policies for clients table
CREATE POLICY "Users can manage their clients" ON public.clients
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Create RLS Policies for user_preferences table
CREATE POLICY "Users can manage their preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();