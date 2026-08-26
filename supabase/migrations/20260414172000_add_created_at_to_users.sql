-- Add created_at to public.users, backfilled from auth.users so the
-- value is identical to the auth account creation timestamp.

ALTER TABLE public.users
  ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill existing rows from auth.users
UPDATE public.users u
SET created_at = au.created_at
FROM auth.users au
WHERE u.user_id = au.id;

-- Update handle_new_user so new rows inherit the auth timestamp
-- (replaces version from 20260414170518_add_account_deletion_support)
CREATE OR REPLACE FUNCTION ops.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Insert stable user identity record first so all FKs below resolve.
  -- Use new.created_at so the timestamp matches auth.users exactly.
  INSERT INTO public.users (user_id, created_at)
  VALUES (new.id, new.created_at)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert public profile
  INSERT INTO public.user_profile (user_id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');

  -- Insert preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);

  -- Generate unique referral code
  LOOP
    new_referral_code := ops.generate_referral_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.user_account WHERE referral_code = new_referral_code
    );
  END LOOP;

  referrer_id := (new.raw_user_meta_data->>'referred_by')::UUID;

  -- Insert private account row
  INSERT INTO public.user_account (user_id, referral_code, referred_by)
  VALUES (new.id, new_referral_code, referrer_id);

  RETURN new;
END;
$$;

ALTER FUNCTION ops.handle_new_user OWNER TO postgres;
