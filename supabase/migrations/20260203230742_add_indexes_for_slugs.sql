
CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_unique 
ON public.event (slug);

CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_unique 
ON public.fight (slug);

CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_unique 
ON public.fighter (slug);