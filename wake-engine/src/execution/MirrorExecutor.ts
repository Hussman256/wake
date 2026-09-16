import { Horizon } from "@stellar/stellar-sdk";
import type { DexAdapter } from "../adapters/DexAdapter.js";
import { pickAdapter } from "../router/index.js";
import { computeMirrorSize } from "../sizing/index.js";
import type { FollowConfig, FollowerContext, MirrorResult, SwapEvent, TransactionSigner } from "../types.js";

export interface MirrorExecutorConfig {
  horizonUrl: string;
  follow: FollowConfig;
  dryRun: boolean;
}

export class MirrorExecutor {
  private readonly horizon: Horizon.Server;

  constructor(
    private readonly adapters: DexAdapter[],
    private readonly signer: TransactionSigner,
    private readonly config: MirrorExecutorConfig,
  ) {
    this.horizon = new Horizon.Server(config.horizonUrl);
  }

  async mirror(sourceSwap: SwapEvent, follower: FollowerContext): Promise<MirrorResult> {
    const adapter = pickAdapter(this.adapters, sourceSwap.dex);

    const mirrorSellAmount = computeMirrorSize(sourceSwap, follower.sellAssetBalance, this.config.follow);
    if (mirrorSellAmount <= 0n) {
      return { submitted: false, dryRun: this.config.dryRun, reason: "computed mirror size was zero", swap: sourceSwap };
    }

    const quote = await adapter.getQuote({
      sellAsset: sourceSwap.sellAsset,
      buyAsset: sourceSwap.buyAsset,
      amount: mirrorSellAmount,
    });

    if (quote.priceImpactBps > this.config.follow.maxSlippageBps) {
      return {
        submitted: false,
        dryRun: this.config.dryRun,
        reason: `quote price impact ${quote.priceImpactBps}bps exceeds maxSlippageBps ${this.config.follow.maxSlippageBps}`,
        swap: sourceSwap,
        quote,
      };
    }

    if (mirrorSellAmount < this.config.follow.minPoolLiquidity) {
      // A liquidity floor check: skip rather than execute into a pool too thin to absorb the trade.
      return {
        submitted: false,
        dryRun: this.config.dryRun,
        reason: "pool liquidity below configured floor",
        swap: sourceSwap,
        quote,
      };
    }

    const minBuyAmount = (quote.buyAmount * BigInt(10_000 - this.config.follow.maxSlippageBps)) / 10_000n;

    const unsignedTx = await adapter.buildSwapTx({
      sourceAccount: follower.account,
      sellAsset: sourceSwap.sellAsset,
      buyAsset: sourceSwap.buyAsset,
      sellAmount: mirrorSellAmount,
      minBuyAmount,
      poolId: quote.poolId,
    });

    if (this.config.dryRun) {
      return { submitted: false, dryRun: true, swap: sourceSwap, quote, mirrorSellAmount, unsignedTx };
    }

    const signedTx = await this.signer.sign(unsignedTx);
    const response = await this.horizon.submitTransaction(signedTx);

    return {
      submitted: true,
      dryRun: false,
      swap: sourceSwap,
      quote,
      mirrorSellAmount,
      unsignedTx,
      txHash: response.hash,
    };
  }
}
