CREATE TABLE public.app_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  maintenance_mode boolean NOT NULL DEFAULT false,
  min_app_version text NOT NULL DEFAULT '1.0.0',
  review_prompt_min_sessions integer NOT NULL DEFAULT 5,
  review_prompt_cooldown_days integer NOT NULL DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_config (id, maintenance_mode, min_app_version, review_prompt_min_sessions, review_prompt_cooldown_days)
VALUES (1, false, '1.0.0', 5, 3);
