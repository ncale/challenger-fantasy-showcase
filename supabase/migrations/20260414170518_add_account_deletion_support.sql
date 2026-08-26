-- =========================================================
-- 1. Create public.users
--    This is the stable user identity record for the app.
--    It is NOT a FK to auth.users, so it survives auth user
--    deletion.  When an auth account is hard-deleted the row
--    stays here; the API layer reads is_deleted to anonymise.
-- =========================================================

CREATE TABLE public.users (
  user_id   UUID        PRIMARY KEY,
  is_deleted BOOLEAN    NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.users OWNER TO postgres;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own row
CREATE POLICY "users_self_select"
  ON public.users FOR SELECT
  USING (auth.uid() = user_id);

-- Backfill from existing accounts (user_config is the source
-- of truth for every registered user)
INSERT INTO public.users (user_id)
SELECT user_id FROM public.user_config
ON CONFLICT (user_id) DO NOTHING;


-- =========================================================
-- 2. Rename user_config → user_account
-- =========================================================

ALTER TABLE public.user_config RENAME TO user_account;

-- Rename the referral trigger so it stays meaningful
ALTER TRIGGER on_user_config_referral
  ON public.user_account
  RENAME TO on_user_account_referral;


-- =========================================================
-- 3. Re-point all auth.users FKs to public.users
--
--    Old constraints keep their auto-generated names after
--    the table rename, so we drop by the original names and
--    add new ones.
--
--    ON DELETE behaviour relative to public.users:
--      - profile / account / preferences: CASCADE
--        (deleting a public.users row cleans these up)
--      - submissions: no action (submissions outlive the user
--        for historical integrity; anonymised in the API)
--      - ranking:    CASCADE (mirrors submission cascade)
--      - referred_by: SET NULL (referrer may be deleted later)
-- =========================================================

-- user_profile
ALTER TABLE public.user_profile
  DROP CONSTRAINT user_profile_user_id_fkey,
  ADD  CONSTRAINT user_profile_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- user_account (was user_config)
ALTER TABLE public.user_account
  DROP CONSTRAINT user_config_user_id_fkey,
  ADD  CONSTRAINT user_account_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.user_account
  DROP CONSTRAINT user_config_referred_by_fkey,
  ADD  CONSTRAINT user_account_referred_by_fkey
    FOREIGN KEY (referred_by) REFERENCES public.users(user_id) ON DELETE SET NULL;

-- user_preferences
ALTER TABLE public.user_preferences
  DROP CONSTRAINT user_preferences_user_id_fkey,
  ADD  CONSTRAINT user_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- daily_mma_game_submission
ALTER TABLE public.daily_mma_game_submission
  DROP CONSTRAINT daily_mma_game_submission_user_id_fkey,
  ADD  CONSTRAINT daily_mma_game_submission_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(user_id);

-- daily_mma_game_submission_ranking
ALTER TABLE public.daily_mma_game_submission_ranking
  DROP CONSTRAINT daily_mma_game_submission_ranking_user_id_fkey,
  ADD  CONSTRAINT daily_mma_game_submission_ranking_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- =========================================================
-- 4. Update handle_new_user to also insert into public.users
--    (replaces the version from 20260330000000_add_push_token)
-- =========================================================

CREATE OR REPLACE FUNCTION ops.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Insert stable user identity record first so all FKs below resolve
  INSERT INTO public.users (user_id)
  VALUES (new.id)
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
