import { Networks } from "@stellar/stellar-sdk";
import { AquariusAdapter } from "../src/adapters/aquarius.js";
import { WalletWatcher } from "../src/watchers/WalletWatcher.js";
import { MirrorExecutor } from "../src/execution/MirrorExecutor.js";
import type { FollowerContext, TransactionSigner } from "../src/types.js";

interface CliArgs {
  command: string;
  follow?: string;
  as?: string;
  amountPct: number;
  network: "testnet" | "mainnet";
  dryRun: boolean;
  balance: bigint;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    command: argv[0] ?? "",
    amountPct: 10,
    network: "testnet",
    dryRun: false,
    balance: 1_000_0000000n, // 1000 XLM in stroops, for demo sizing when no real follower account is wired up
  };

  for (let i = 1; i < argv.length; i++) {
    const flag = argv[i];
    switch (flag) {
      case "--follow":
        args.follow = argv[++i];
        break;
      case "--as":
        args.as = argv[++i];
        break;
      case "--amount-pct":
        args.amountPct = Number(argv[++i]);
        break;
      case "--network":
        args.network = argv[++i] === "mainnet" ? "mainnet" : "testnet";
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--balance":
        args.balance = BigInt(argv[++i] ?? "0");
        break;
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }

  return args;
}

function networkConfig(network: "testnet" | "mainnet") {
  return network === "mainnet"
    ? { horizonUrl: "https://horizon.stellar.org", networkPassphrase: Networks.PUBLIC }
    : { horizonUrl: "https://horizon-testnet.stellar.org", networkPassphrase: Networks.TESTNET };
}

const unsupportedSigner: TransactionSigner = {
  async sign() {
    throw new Error("No signer wired up yet — run with --dry-run, or plug in Freighter/a hardware signer.");
  },
};

async function runMirror(args: CliArgs) {
  if (!args.follow) {
    throw new Error("--follow <walletAddress> is required");
  }
  if (!args.dryRun) {
    throw new Error("Live signing isn't wired up yet in the CLI demo — pass --dry-run.");
  }

  const config = networkConfig(args.network);
  const adapter = new AquariusAdapter(config);
  const watcher = new WalletWatcher({ horizonUrl: config.horizonUrl, pollIntervalMs: 5000 }, [adapter]);
  const executor = new MirrorExecutor([adapter], unsupportedSigner, {
    horizonUrl: config.horizonUrl,
    dryRun: true,
    follow: {
      mode: "proportional",
      maxPositionPct: args.amountPct / 100,
      maxSlippageBps: 100,
      minPoolLiquidity: 0n,
    },
  });

  const follower: FollowerContext = {
    account: args.as ?? args.follow,
    sellAssetBalance: args.balance,
  };

  console.log(`[wake] watching ${args.follow} on ${args.network} (dry-run, mirroring ${args.amountPct}% of balance)`);

  const unsubscribe = watcher.watch(args.follow, (swap) => {
    console.log(`[wake] detected swap in tx ${swap.txHash}: ${swap.sellAsset.code} -> ${swap.buyAsset.code}`);
    executor
      .mirror(swap, follower)
      .then((result) => {
        console.log("[wake] mirror result:", {
          submitted: result.submitted,
          dryRun: result.dryRun,
          reason: result.reason,
          mirrorSellAmount: result.mirrorSellAmount?.toString(),
          quote: result.quote,
        });
      })
      .catch((err) => console.error("[wake] mirror failed:", err));
  });

  process.on("SIGINT", () => {
    unsubscribe();
    process.exit(0);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command !== "mirror") {
    console.error("Usage: wake mirror --follow <wallet> [--amount-pct 10] [--network testnet] --dry-run [--as <followerAccount>] [--balance <stroops>]");
    process.exit(1);
  }
  await runMirror(args);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
