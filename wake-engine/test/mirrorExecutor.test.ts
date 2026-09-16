import { describe, expect, it, vi } from "vitest";
import { MirrorExecutor } from "../src/execution/MirrorExecutor.js";
import type { DexAdapter } from "../src/adapters/DexAdapter.js";
import type { FollowerContext, Quote, SwapEvent, TransactionSigner } from "../src/types.js";

const swap: SwapEvent = {
  dex: "mock",
  wallet: "GSOURCE",
  txHash: "tx1",
  ledgerSeq: 1,
  sellAsset: { code: "XLM" },
  buyAsset: { code: "AQUA", issuer: "GISSUER" },
  sellAmount: 100_0000000n,
  buyAmount: 50_0000000n,
  timestamp: new Date(),
};

const follower: FollowerContext = { account: "GFOLLOWER", sellAssetBalance: 1_000_0000000n };

function makeAdapter(quote: Partial<Quote> = {}): DexAdapter {
  return {
    name: "mock",
    getQuote: vi.fn(async () => ({
      dex: "mock",
      sellAsset: swap.sellAsset,
      buyAsset: swap.buyAsset,
      sellAmount: 100_0000000n,
      buyAmount: 50_0000000n,
      priceImpactBps: 10,
      poolId: "pool1",
      ...quote,
    })),
    buildSwapTx: vi.fn(async () => ({}) as never),
    parseSwapFromLedgerEntry: () => null,
  };
}

const signer: TransactionSigner = { sign: vi.fn(async (tx) => tx) };

describe("MirrorExecutor.mirror", () => {
  it("returns an unsigned tx in dry-run without calling the signer", async () => {
    const adapter = makeAdapter();
    const executor = new MirrorExecutor([adapter], signer, {
      horizonUrl: "https://horizon-testnet.stellar.org",
      dryRun: true,
      follow: { mode: "proportional", maxPositionPct: 0.1, maxSlippageBps: 100, minPoolLiquidity: 0n },
    });

    const result = await executor.mirror(swap, follower);

    expect(result.dryRun).toBe(true);
    expect(result.submitted).toBe(false);
    expect(result.mirrorSellAmount).toBe(100_0000000n);
    expect(signer.sign).not.toHaveBeenCalled();
  });

  it("skips when price impact exceeds maxSlippageBps", async () => {
    const adapter = makeAdapter({ priceImpactBps: 500 });
    const executor = new MirrorExecutor([adapter], signer, {
      horizonUrl: "https://horizon-testnet.stellar.org",
      dryRun: true,
      follow: { mode: "proportional", maxPositionPct: 0.1, maxSlippageBps: 100, minPoolLiquidity: 0n },
    });

    const result = await executor.mirror(swap, follower);

    expect(result.submitted).toBe(false);
    expect(result.reason).toMatch(/price impact/);
  });

  it("skips when computed mirror size is below the liquidity floor", async () => {
    const adapter = makeAdapter();
    const executor = new MirrorExecutor([adapter], signer, {
      horizonUrl: "https://horizon-testnet.stellar.org",
      dryRun: true,
      follow: { mode: "proportional", maxPositionPct: 0.1, maxSlippageBps: 100, minPoolLiquidity: 1_000_0000000n },
    });

    const result = await executor.mirror(swap, follower);

    expect(result.submitted).toBe(false);
    expect(result.reason).toMatch(/liquidity/);
  });

  it("skips when computed mirror size is zero", async () => {
    const adapter = makeAdapter();
    const executor = new MirrorExecutor([adapter], signer, {
      horizonUrl: "https://horizon-testnet.stellar.org",
      dryRun: true,
      follow: { mode: "proportional", maxPositionPct: 0.1, maxSlippageBps: 100, minPoolLiquidity: 0n },
    });

    const result = await executor.mirror(swap, { account: "GFOLLOWER", sellAssetBalance: 0n });

    expect(result.submitted).toBe(false);
    expect(result.reason).toMatch(/zero/);
  });
});
