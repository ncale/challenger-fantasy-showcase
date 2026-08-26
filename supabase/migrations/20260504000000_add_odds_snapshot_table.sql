CREATE TABLE odds_snapshot (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fight_id         uuid        NOT NULL REFERENCES fight(id) ON DELETE CASCADE,
  fighter_id       uuid        NOT NULL REFERENCES fighter(id) ON DELETE CASCADE,
  avg_decimal_odds numeric     NOT NULL,
  fair_probability numeric     NOT NULL,
  bookmaker_count  integer     NOT NULL,
  fetched_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_odds_snapshot_fight ON odds_snapshot(fight_id, fetched_at);
