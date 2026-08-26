CREATE TABLE public.user_pick_ranking (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES public.event(id) ON DELETE CASCADE,
  mode       TEXT NOT NULL DEFAULT 'standard' CHECK (mode IN ('standard', 'split_entity')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id, mode)
);

ALTER TABLE public.user_pick_ranking ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_pick_ranking_entry (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_id  UUID NOT NULL REFERENCES public.user_pick_ranking(id) ON DELETE CASCADE,
  fighter_id  UUID NOT NULL REFERENCES public.fighter(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ranking_id, fighter_id)
);

ALTER TABLE public.user_pick_ranking_entry ENABLE ROW LEVEL SECURITY;

CREATE INDEX ON public.user_pick_ranking_entry (ranking_id, position);
