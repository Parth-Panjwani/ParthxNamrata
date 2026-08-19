-- ====================================================================
-- SUPABASE DATABASE SETUP FOR PARTH & NAMRATA WEDDING WEBAPP
-- Copy and run this entire script in your Supabase SQL Editor.
-- ====================================================================

-- 1. Create app_role ENUM type if it doesn't already exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create user_roles table for role-based access control (RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- 3. Create helper function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 4. Create invitation_groups table
CREATE TABLE IF NOT EXISTS public.invitation_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  side text NOT NULL DEFAULT 'both',
  guest_count integer NOT NULL DEFAULT 1,
  invited_days text NOT NULL DEFAULT 'both',
  contact_mobile text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitation_groups TO authenticated;
GRANT ALL ON public.invitation_groups TO service_role;
ALTER TABLE public.invitation_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage invitation groups" ON public.invitation_groups;
CREATE POLICY "Admins manage invitation groups" ON public.invitation_groups 
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Create rsvp_responses table (matching updated form fields)
CREATE TABLE IF NOT EXISTS public.rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.invitation_groups(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  mobile text NOT NULL DEFAULT '',
  attendance text NOT NULL DEFAULT 'yes',
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  attending_days text NOT NULL DEFAULT 'both',
  travel_city text,
  travel_mode text,
  arrival_date date,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure ALL columns exist and reload PostgREST schema cache if table already exists with older schema
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS mobile text NOT NULL DEFAULT '';
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS attendance text NOT NULL DEFAULT 'yes';
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS adults integer NOT NULL DEFAULT 1;
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS children integer NOT NULL DEFAULT 0;
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS attending_days text NOT NULL DEFAULT 'both';
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS travel_city text;
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS travel_mode text;
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS arrival_date date;
ALTER TABLE public.rsvp_responses ADD COLUMN IF NOT EXISTS message text;

-- Drop NOT NULL constraints on legacy column names if they existed in prior schemas
DO $$ BEGIN
  ALTER TABLE public.rsvp_responses ALTER COLUMN guest_name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.rsvp_responses ALTER COLUMN name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

NOTIFY pgrst, 'reload schema';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvp_responses TO authenticated;
GRANT ALL ON public.rsvp_responses TO service_role;
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage rsvp responses" ON public.rsvp_responses;
CREATE POLICY "Admins manage rsvp responses" ON public.rsvp_responses 
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Trigger for updated_at timestamp updates
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; $$;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rsvp_responses_updated_at ON public.rsvp_responses;
CREATE TRIGGER rsvp_responses_updated_at 
  BEFORE UPDATE ON public.rsvp_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS rsvp_responses_created_at_idx ON public.rsvp_responses (created_at DESC);

-- 7. Automatically grant admin access to admin email when signed up
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'parth.namrata2027@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
