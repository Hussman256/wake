import { describe, expect, it } from "vitest";
import { computeMirrorSize } from "../src/sizing/index.js";
import type { FollowConfig, SwapEvent } from "../src/types.js";

const dummySwap: SwapEvent = {
  dex: "aquarius",
  wallet: "GSOURCE",
  txHash: "abc",
  ledgerSeq: 1,
  sellAsset: { code: "XLM" },
  buyAsset: { code: "AQUA", issuer: "GISSUER" },
  sellAmount: 1_000_0000000n,
  buyAmount: 500_0000000n,
  timestamp: new Date(),
};

describe("computeMirrorSize", () => {
  it("proportional mode uses maxPositionPct of follower balance", () => {
    const config: FollowConfig = {
      mode: "proportional",
      maxPositionPct: 0.1,
      maxSlippageBps: 100,
      minPoolLiquidity: 0n,
    };
    expect(computeMirrorSize(dummySwap, 1_000_0000000n, config)).toBe(100_0000000n);
  });

  it("fixed mode uses fixedAmount when under the cap", () => {
    const config: FollowConfig = {
      mode: "fixed",
      maxPositionPct: 0.5,
      maxSlippageBps: 100,
      minPoolLiquidity: 0n,
      fixedAmount: 10_0000000n,
    };
    expect(computeMirrorSize(dummySwap, 1_000_0000000n, config)).toBe(10_0000000n);
  });

  it("fixed mode is capped by maxPositionPct", () => {
    const config: FollowConfig = {
      mode: "fixed",
      maxPositionPct: 0.05,
      maxSlippageBps: 100,
      minPoolLiquidity: 0n,
      fixedAmount: 900_0000000n,
    };
    expect(computeMirrorSize(dummySwap, 1_000_0000000n, config)).toBe(50_0000000n);
  });

  it("returns 0 for a non-positive follower balance", () => {
    const config: FollowConfig = {
      mode: "proportional",
      maxPositionPct: 0.1,
      maxSlippageBps: 100,
      minPoolLiquidity: 0n,
    };
    expect(computeMirrorSize(dummySwap, 0n, config)).toBe(0n);
    expect(computeMirrorSize(dummySwap, -5n, config)).toBe(0n);
  });
});
