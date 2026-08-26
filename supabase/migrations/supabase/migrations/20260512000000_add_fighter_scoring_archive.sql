CREATE TABLE fighter_scoring_archive (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fight_id         uuid        NOT NULL REFERENCES fight(id) ON DELETE CASCADE,
  fighter_id       uuid        NOT NULL REFERENCES fighter(id) ON DELETE CASCADE,
  scoring_profile  text        NOT NULL,
  score            numeric     NOT NULL,
  breakdown        jsonb       NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fight_id, fighter_id, scoring_profile)
);

CREATE INDEX idx_fighter_scoring_archive_fight ON fighter_scoring_archive(fight_id);