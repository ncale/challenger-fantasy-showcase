-- Add Expo push notification token storage to user_config.
-- This column is written by the mobile app after obtaining the token
-- (without prompting the user for permission — the token is only written
-- once permission has already been granted).

ALTER TABLE public.user_config
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Update user trigger function

CREATE OR REPLACE FUNCTION ops.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  insert into public.user_profile (user_id, username)
  values (
    new.id,
    new.raw_user_meta_data->>'username'
  );
 
  insert into public.user_config (user_id)
  values (new.id);
 
  insert into public.user_preferences (user_id)
  values (new.id);
 
  return new;
end;
$$;
 