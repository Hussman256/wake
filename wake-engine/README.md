# wake-engine

Non-custodial copy-trading SDK for Stellar/Soroban DEXs. Watches a followed
wallet's swaps, sizes a proportional (or fixed) mirror trade against your own
balance, and builds an unsigned transaction for you to sign — wake-engine
never holds keys and never signs on your behalf.

v1 targets [Aquarius](https://aqua.network) pools only, which run on Stellar's
classic constant-product liquidity pools.

## Install

```bash
pnpm install
pnpm build
```

## CLI demo

```bash
pnpm cli mirror --follow GABC...XYZ --amount-pct 10 --network testnet --dry-run
```

This watches `GABC...XYZ` on testnet and, when it detects a real Aquarius
swap, prints the mirrored trade wake-engine would build — sized to 10% of a
demo balance — without signing or submitting anything. Drop `--dry-run` once
a real signer is wired in to submit for real (not yet supported by the CLI;
see [Security Non-Negotiables](../README.md#security)).

Flags:

| Flag | Description | Default |
| --- | --- | --- |
| `--follow <address>` | Wallet to watch (required) | — |
| `--amount-pct <n>` | % of follower balance to mirror with | `10` |
| `--network <testnet\|mainnet>` | Stellar network | `testnet` |
| `--dry-run` | Required today — no live signer wired up yet | — |
| `--as <address>` | Follower account the mirrored tx is built for | same as `--follow` |
| `--balance <stroops>` | Demo follower balance, since no real account is wired up | `10000000000` (1000 XLM) |

## Library usage

```ts
import { AquariusAdapter, TESTNET_CONFIG, WalletWatcher, MirrorExecutor } from "wake-engine";

const adapter = new AquariusAdapter(TESTNET_CONFIG);
const watcher = new WalletWatcher({ horizonUrl: TESTNET_CONFIG.horizonUrl, pollIntervalMs: 5000 }, [adapter]);

const unsubscribe = watcher.watch(followedWallet, async (swap) => {
  const result = await executor.mirror(swap, follower);
  // result.unsignedTx is ready for Freighter (or your signer) to sign
});
```

## Module layout

```
src/
  watchers/      # poll/stream a followed wallet's swaps off Horizon or RPC
  adapters/      # aquarius.ts, soroswap.ts, phoenix.ts - one DexAdapter each
  router/        # picks the adapter/pool for a trade, handles slippage
  sizing/        # proportional position sizing and risk limits
  execution/     # builds and signs the mirrored transaction
  types.ts
cli/             # `wake mirror --follow <wallet> --testnet` demo command
test/
examples/
```

## Testing

```bash
pnpm test
```

## Adding a DEX adapter

Implement the [`DexAdapter`](./src/adapters/DexAdapter.ts) interface in a new
file under `src/adapters/`, register it in the router, and add parsing tests
mirroring [`test/aquarius.test.ts`](./test/aquarius.test.ts). See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the current good-first-issues.
