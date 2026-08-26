
-- Drop existing primary key constraint
ALTER TABLE public.alias
DROP CONSTRAINT alias_pkey;

-- Add new primary key constraint on all three columns
ALTER TABLE public.alias
ADD CONSTRAINT alias_pkey PRIMARY KEY (source, external_id, entity_type);

-- Add index on internal_id
create index alias_internal_id_idx on public.alias (internal_id);
