# wake-web

The Wake web app (Next.js App Router): connect a Stellar wallet with
Freighter, discover ranked wallets, dig into a wallet's dossier, set mirror
limits with a live preview, and manage your mirrors from a desktop-sized
dashboard. Non-custodial — Wake never asks for or stores a secret key.

Implements the six-screen `Wake Web App` design (Connect, Discover, Dossier,
Mirror setup, Portfolio, Sign) as a real, responsive app rather than fixed
1560×980 mockup canvases.

## Screens (`app/`)

- `/` — Connect: the marketing hero plus wallet picker. Freighter connects
  for real via `@stellar/freighter-api`; Albedo/Ledger are shown per the
  design but not wired up yet.
- `/discover` — ranked wallets, cohorts, and a live-feed rail. Reads
  `wake-leaderboard`'s `/leaderboard`; falls back to illustrative demo data
  (clearly labeled) when that service isn't running.
- `/discover/[address]` — a wallet's dossier: stats, an equity curve, and
  its real trade ledger via `wake-leaderboard`'s `/wallets/:address/trades`.
- `/mirror/[address]` — set capital allocated, max size per trade, slippage
  and stop-loss against your real testnet XLM balance, with a live preview
  and a Sign-modal walkthrough of what confirming in Freighter looks like.
- `/portfolio` — your saved mirror configs (real, persisted), plus
  illustrative open positions and a mirror log matching the design.

## Run it

```bash
pnpm install
pnpm --filter wake-web dev
```

Set `NEXT_PUBLIC_LEADERBOARD_API_URL` (defaults to `http://localhost:3001`)
to point Discover/Dossier at a running `wake-app/backend` instance.

## wake-engine integration

`lib/wake-engine-client.ts` wraps `wake-engine`'s `AquariusAdapter` and
`computeMirrorSize` for real testnet sizing/quoting, and `lib/polyfills.ts`
sets the `Buffer` global `@stellar/stellar-sdk` needs in the browser (must
be imported before anything that touches `wake-engine` or `stellar-sdk`).

## What's illustrative vs. real

Wallet balances, leaderboard stats, and a wallet's trade ledger are real
when `wake-leaderboard` (and a funded testnet account) are available.
Equity curves, cohorts, the live feed, open positions, and the mirror log
are deterministic-but-synthetic — ported from the design's own demo data
generator — since wake-leaderboard doesn't expose time-series history or
live execution yet. Each such section is labeled "illustrative" in the UI.

## Testing

```bash
pnpm --filter wake-web lint
pnpm --filter wake-web typecheck
pnpm --filter wake-web build
```
