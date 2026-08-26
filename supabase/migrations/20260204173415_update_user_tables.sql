-- 1. Create the Custom Enum Type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending', 'rejected', 'active', 'suspended', 'deactivated');
    END IF;
END $$;

-- 2. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Set up RLS Policies for user_preferences
-- (Cleanup old naming conventions if they exist from previous iterations)
DROP POLICY IF EXISTS "enable_self_read_access_for_authenticated_users" ON public.user_config;
DROP POLICY IF EXISTS "enable_self_update_access_for_authenticated_users" ON public.user_config;

-- Owner can read their own preferences
CREATE POLICY "enable_self_read_access_for_authenticated_users"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Owner can update their own preferences
CREATE POLICY "enable_self_update_access_for_authenticated_users"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Modify existing user_config table
-- Drop the old jsonb column
ALTER TABLE public.user_config 
DROP COLUMN IF EXISTS config;

-- Add the status column using the new Enum
-- Default to 'pending' while in beta
ALTER TABLE public.user_config 
ADD COLUMN status user_status NOT NULL DEFAULT 'pending';

-- 6. Modify existing user_profile table
-- Add updated_at column
ALTER TABLE public.user_profile 
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- 7. Add a trigger to update 'updated_at' on user_preferences and user_profile (Optional but recommended)
create trigger user_profile_updated_at
before update on "public"."user_profile"
for each row
execute function ops.set_updated_at();

create trigger user_preferences_updated_at
before update on "public"."user_preferences"
for each row
execute function ops.set_updated_at();