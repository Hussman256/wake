# Wake

Non-custodial copy-trading for Stellar/Soroban DEXs. Follow a wallet, mirror
its swaps proportionally, never give up your keys.

## Packages

- [`wake-engine`](./wake-engine) — the TypeScript SDK: watches a followed
  wallet, sizes and builds mirrored swap transactions, exposes a CLI demo.
- [`wake-app`](./wake-app) — the React Native (Expo) app: wallet connect,
  leaderboard, follow flow, portfolio.

This started as a single build-plan doc; the two packages are kept
independent inside this repo (own `package.json`, own README) so either can
be split into its own repo later without restructuring.

## Status

Early build. See [`wake-engine/README.md`](./wake-engine/README.md) for the
CLI demo and [`wake-engine/CONTRIBUTING.md`](./wake-engine/CONTRIBUTING.md)
for good-first-issues.

## Security

Wake is non-custodial: it never holds private keys. Every transaction is
built unsigned by `wake-engine` and signed client-side (Freighter or a
hardware signer). This is not financial advice. Testnet only until the
engine has test coverage on swap/sizing math and an informal security pass.
