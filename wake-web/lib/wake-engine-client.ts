import "./polyfills";
import { AquariusAdapter, TESTNET_CONFIG, computeMirrorSize, type Asset, type FollowConfig } from "wake-engine";

const adapter = new AquariusAdapter(TESTNET_CONFIG);

export interface MirrorPreviewInput {
  sellAsset: Asset;
  buyAsset: Asset;
  sourceSellAmountStroops: bigint;
  followerBalanceStroops: bigint;
  follow: FollowConfig;
}

export interface MirrorPreviewResult {
  mirrorSellAmountStroops: bigint;
  quote: Awaited<ReturnType<typeof adapter.getQuote>> | null;
  error: string | null;
}

/**
 * Runs the same sizing + quoting path wake-engine's CLI and MirrorExecutor
 * use, against testnet Aquarius pools, so the Mirror setup and Sign screens
 * show real numbers rather than only the design's illustrative preview.
 */
export async function previewMirror(input: MirrorPreviewInput): Promise<MirrorPreviewResult> {
  const mirrorSellAmountStroops = computeMirrorSize(
    {
      dex: "aquarius",
      wallet: "",
      txHash: "",
      ledgerSeq: 0,
      sellAsset: input.sellAsset,
      buyAsset: input.buyAsset,
      sellAmount: input.sourceSellAmountStroops,
      buyAmount: 0n,
      timestamp: new Date(),
    },
    input.followerBalanceStroops,
    input.follow,
  );

  if (mirrorSellAmountStroops <= 0n) {
    return { mirrorSellAmountStroops, quote: null, error: "Computed mirror size was zero" };
  }

  try {
    const quote = await adapter.getQuote({
      sellAsset: input.sellAsset,
      buyAsset: input.buyAsset,
      amount: mirrorSellAmountStroops,
    });
    return { mirrorSellAmountStroops, quote, error: null };
  } catch (err) {
    return { mirrorSellAmountStroops, quote: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export function stroopsToDisplay(stroops: bigint, decimals = 2): string {
  return (Number(stroops) / 1e7).toLocaleString(undefined, { maximumFractionDigits: decimals });
}
