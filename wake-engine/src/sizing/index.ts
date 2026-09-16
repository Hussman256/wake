import type { FollowConfig, SwapEvent } from "../types.js";

/**
 * Sizes the follower's mirror trade.
 * - "proportional": use maxPositionPct of the follower's own balance (this is
 *   what the app's "% of balance to allocate" follow-setting maps to).
 * - "fixed": use config.fixedAmount, still capped by maxPositionPct as a
 *   safety net against a stale/misconfigured fixed amount.
 */
export function computeMirrorSize(
  sourceSwap: SwapEvent,
  followerBalance: bigint,
  config: FollowConfig,
): bigint {
  void sourceSwap; // reserved for source-relative sizing strategies later
  if (followerBalance <= 0n) return 0n;

  const cap = (followerBalance * BigInt(Math.round(config.maxPositionPct * 10_000))) / 10_000n;

  if (config.mode === "fixed") {
    const desired = config.fixedAmount ?? 0n;
    return desired < cap ? desired : cap;
  }

  return cap;
}
