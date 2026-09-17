# wake-leaderboard

Cron indexer + small REST API backing the app's leaderboard screen.

- A cron job pulls each tracked wallet's recent Horizon operations, stores
  Aquarius swaps, and recomputes 30-day realized PnL% and win rate
  (weighted-average cost basis, XLM-denominated pairs — see
  [`src/pnl.ts`](./src/pnl.ts) for the exact method and its v1 limitations).
- A REST API (`GET /leaderboard`, `GET /wallets/:address`,
  `GET /wallets/:address/trades`, `POST /wallets/:address/follow`) serves
  that data to the app.

## Setup

```bash
createdb wake_leaderboard   # or point DATABASE_URL at any Postgres instance
export DATABASE_URL=postgres://localhost/wake_leaderboard
pnpm --filter wake-leaderboard migrate
```

## Cold start

Don't wait for organic wallet discovery — seed the tracked list from the
top Aquarius liquidity providers/traders visible on stellar.expert:

```bash
SEED_WALLETS="GABC...1,GABC...2" pnpm --filter wake-leaderboard seed
```

## Run

```bash
pnpm --filter wake-leaderboard cron   # one-off refresh; put this on a schedule (e.g. every 5 min)
pnpm --filter wake-leaderboard dev    # REST API on :3001
```

## Testing

```bash
pnpm --filter wake-leaderboard test
```
