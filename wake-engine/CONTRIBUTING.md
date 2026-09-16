# Contributing to wake-engine

Thanks for looking at wake-engine. This is early-stage — v1 only covers
Aquarius pools on testnet, non-custodial, no live signing yet.

## Setup

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
```

## Good first issues

Issues labeled `good-first-issue` on the tracker are scoped to be doable
without deep context on the rest of the codebase. Current areas open for
contribution:

- **Soroswap adapter** — implement `DexAdapter` for Soroswap in
  `src/adapters/soroswap.ts`, following `src/adapters/aquarius.ts` as a
  reference. Needs `getQuote`, `buildSwapTx`, and
  `parseSwapFromLedgerEntry`, plus a `test/soroswap.test.ts` mirroring
  `test/aquarius.test.ts`.
- **Phoenix adapter** — same shape as above, for the Phoenix DEX.
- **Sizing edge-case tests** — `src/sizing/index.ts` has straightforward
  coverage today; add cases for very small balances, `maxPositionPct` at
  the boundaries (0 and 1), and fixed-mode overflow beyond the cap.
- **Docs** — expand the root `README.md` and this package's `README.md` as
  behavior lands; keep the CLI flag table in sync with `cli/index.ts`.
- **Language-binding stub** — a minimal non-TypeScript client (even just a
  typed HTTP/CLI wrapper) that calls the `wake` CLI and parses its output,
  as a starting point for non-JS integrations.

## Pull requests

- Keep adapters isolated: one file per DEX, implementing `DexAdapter`
  exactly — don't reach into the watcher/router/executor to special-case a
  new DEX.
- Add or update tests alongside any behavior change; `pnpm test` must pass.
- No mainnet fund-flow code until wake-engine has a security pass — flag
  anything that touches live signing or submission for extra review.
