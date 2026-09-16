# wake-app

The Wake mobile app (Expo Router, React Native): connect a Stellar wallet,
browse the Aquarius leaderboard, follow a wallet, and watch mirrored trades
land in your portfolio. Non-custodial — Wake never asks for or stores a
secret key.

## Screens (`app/`)

- `onboarding/` — what Wake does, non-custodial disclaimer, risk acknowledgment gate.
- `connect-wallet/` — Freighter deep-link connect flow.
- `leaderboard/` — wallets ranked by 30-day PnL% and win rate, pulled from `backend/`.
- `follow/[walletId]/` — set % of balance to allocate, max slippage, stop-loss, confirm.
- `portfolio/` — wallets you're currently following, unfollow.
- `settings/` — wallet address, notification toggle, disconnect.

## Run it

```bash
pnpm install
pnpm --filter wake-app start
```

Requires Expo Go (or a dev client) on a device/simulator — this repo doesn't
include native Android/iOS project files.

Set `EXPO_PUBLIC_LEADERBOARD_API_URL` (defaults to `http://localhost:3001`)
to point the app at a running `backend/` instance.

## wake-engine integration

`src/services/wake-engine-client.ts` wraps `wake-engine`'s `WalletWatcher`,
`AquariusAdapter`, and `MirrorExecutor` for in-app use, and
`src/polyfills.ts` sets the `Buffer` global `@stellar/stellar-sdk` expects
in the React Native runtime (must be imported before anything that touches
`wake-engine`). Wiring the Freighter `signTransaction` result into
`createFreighterSigner` — and driving `WalletWatcher`/`MirrorExecutor` from
a followed-wallet screen in the background — is tracked as a
good-first-issue rather than done here.

## Leaderboard/indexer service (`backend/`)

See [`backend/README.md`](./backend/README.md).
