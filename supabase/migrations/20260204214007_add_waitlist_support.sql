-- Migration: Add waitlist support

-- 1. Create helper function to generate referral codes
CREATE OR REPLACE FUNCTION ops.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_temp, public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

ALTER FUNCTION ops.generate_referral_code OWNER TO db_owner;

-- 2. Add new columns to user_config table
ALTER TABLE public.user_config
ADD COLUMN IF NOT EXISTS user_number SERIAL,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS referral_bonus INT DEFAULT 0;

-- 3. Update the handle_new_user trigger function
CREATE OR REPLACE FUNCTION ops.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_temp, public
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := ops.generate_referral_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.user_config WHERE referral_code = new_referral_code
    );
  END LOOP;

  -- Check for referrer in user metadata
  referrer_id := (new.raw_user_meta_data->>'referred_by')::UUID;

  -- Insert user profile (public)
  INSERT INTO public.user_profile (user_id)
  VALUES (new.id);

	-- Insert user preferences (public)
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);

  -- Insert user config (private) with waitlist fields
  INSERT INTO public.user_config (user_id, referral_code, referred_by)
  VALUES (new.id, new_referral_code, referrer_id);

  RETURN new;
END;
$$;

ALTER FUNCTION ops.handle_new_user OWNER TO db_owner;

-- 4. Create trigger to increment referrer's referral_bonus when new user signs up via referral
CREATE OR REPLACE FUNCTION ops.handle_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_temp, public
AS $$
BEGIN
  -- Increment referral bonus for the referrer
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.user_config
    SET referral_bonus = referral_bonus + 1
    WHERE user_id = NEW.referred_by;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION ops.handle_referral_bonus OWNER TO db_owner;

-- Create trigger on user_config insert
DROP TRIGGER IF EXISTS on_user_config_referral ON public.user_config;
CREATE TRIGGER on_user_config_referral
  AFTER INSERT ON public.user_config
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL)
  EXECUTE FUNCTION ops.handle_referral_bonus();

-- 5. Backfill existing users with referral codes and user_numbers
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
BEGIN
  FOR rec IN SELECT user_id FROM public.user_config WHERE referral_code IS NULL
  LOOP
    LOOP
      new_code := ops.generate_referral_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.user_config WHERE referral_code = new_code
      );
    END LOOP;

    UPDATE public.user_config
    SET referral_code = new_code
    WHERE user_id = rec.user_id;
  END LOOP;
END $$;
