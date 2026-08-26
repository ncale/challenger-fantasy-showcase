-- Migration: Add user_config RLS policy to allow reading

CREATE POLICY "enable_self_read_access_for_authenticated_users"
  ON public.user_config
  FOR SELECT
  USING (auth.uid() = user_id);
