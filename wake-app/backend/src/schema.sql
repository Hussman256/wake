-- Leaderboard indexer schema. Postgres in production; the same DDL runs
-- fine against SQLite for local dev with minor type substitutions if ever
-- needed (bigint -> integer, timestamptz -> text).

CREATE TABLE IF NOT EXISTS tracked_wallets (
  address     TEXT PRIMARY KEY,
  label       TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trades (
  id            BIGSERIAL PRIMARY KEY,
  wallet        TEXT NOT NULL REFERENCES tracked_wallets(address),
  dex           TEXT NOT NULL,
  tx_hash       TEXT NOT NULL,
  sell_code     TEXT NOT NULL,
  sell_issuer   TEXT,
  buy_code      TEXT NOT NULL,
  buy_issuer    TEXT,
  sell_amount   BIGINT NOT NULL,
  buy_amount    BIGINT NOT NULL,
  traded_at     TIMESTAMPTZ NOT NULL,
  UNIQUE (wallet, tx_hash)
);

CREATE INDEX IF NOT EXISTS trades_wallet_traded_at_idx ON trades (wallet, traded_at);

CREATE TABLE IF NOT EXISTS followers (
  id              BIGSERIAL PRIMARY KEY,
  followed_wallet TEXT NOT NULL REFERENCES tracked_wallets(address),
  follower_wallet TEXT NOT NULL,
  followed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (followed_wallet, follower_wallet)
);

CREATE TABLE IF NOT EXISTS wallet_stats (
  wallet            TEXT PRIMARY KEY REFERENCES tracked_wallets(address),
  pnl_30d_stroops   BIGINT NOT NULL DEFAULT 0,
  pnl_30d_pct       DOUBLE PRECISION NOT NULL DEFAULT 0,
  win_rate          DOUBLE PRECISION NOT NULL DEFAULT 0,
  trade_count_30d   INTEGER NOT NULL DEFAULT 0,
  follower_count    INTEGER NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
