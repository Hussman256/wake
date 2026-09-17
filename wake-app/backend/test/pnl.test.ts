import { describe, expect, it } from "vitest";
import { computeWalletStats, walkTrades, type TradeRow } from "../src/pnl.js";

function trade(overrides: Partial<TradeRow>): TradeRow {
  return {
    sellCode: "XLM",
    sellIssuer: null,
    buyCode: "AQUA",
    buyIssuer: "GISSUER",
    sellAmount: 100_0000000n,
    buyAmount: 50_0000000n,
    tradedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("computeWalletStats", () => {
  it("computes a win when the exit proceeds exceed the cost basis", () => {
    const trades: TradeRow[] = [
      // Buy 50 AQUA for 100 XLM (cost basis: 2 XLM per AQUA)
      trade({
        sellCode: "XLM",
        sellIssuer: null,
        buyCode: "AQUA",
        buyIssuer: "GISSUER",
        sellAmount: 100_0000000n,
        buyAmount: 50_0000000n,
        tradedAt: new Date("2026-01-01T00:00:00Z"),
      }),
      // Sell 50 AQUA for 150 XLM -> +50 XLM realized profit
      trade({
        sellCode: "AQUA",
        sellIssuer: "GISSUER",
        buyCode: "XLM",
        buyIssuer: null,
        sellAmount: 50_0000000n,
        buyAmount: 150_0000000n,
        tradedAt: new Date("2026-01-02T00:00:00Z"),
      }),
    ];

    const stats = computeWalletStats(trades);

    expect(stats.realizedPnlStroops).toBe(50_0000000n);
    expect(stats.winRate).toBe(1);
    expect(stats.pnlPct).toBeCloseTo(0.5, 5);
  });

  it("computes a loss when exit proceeds are below cost basis", () => {
    const trades: TradeRow[] = [
      trade({ sellCode: "XLM", sellIssuer: null, buyCode: "AQUA", buyIssuer: "GISSUER", sellAmount: 100_0000000n, buyAmount: 50_0000000n }),
      trade({
        sellCode: "AQUA",
        sellIssuer: "GISSUER",
        buyCode: "XLM",
        buyIssuer: null,
        sellAmount: 50_0000000n,
        buyAmount: 80_0000000n,
        tradedAt: new Date("2026-01-02T00:00:00Z"),
      }),
    ];

    const stats = computeWalletStats(trades);

    expect(stats.realizedPnlStroops).toBe(-20_0000000n);
    expect(stats.winRate).toBe(0);
  });

  it("skips asset-to-asset trades that never touch XLM", () => {
    const trades: TradeRow[] = [
      trade({ sellCode: "AQUA", sellIssuer: "GISSUER", buyCode: "USDC", buyIssuer: "GUSDC" }),
    ];

    const stats = computeWalletStats(trades);

    expect(stats.realizedPnlStroops).toBe(0n);
    expect(stats.winRate).toBe(0);
  });

  it("ignores an exit with no prior recorded entry", () => {
    const trades: TradeRow[] = [
      trade({ sellCode: "AQUA", sellIssuer: "GISSUER", buyCode: "XLM", buyIssuer: null, sellAmount: 10_0000000n, buyAmount: 20_0000000n }),
    ];

    const stats = computeWalletStats(trades);

    expect(stats.realizedPnlStroops).toBe(0n);
  });

  it("returns zeroed stats for no trades", () => {
    const stats = computeWalletStats([]);
    expect(stats.realizedPnlStroops).toBe(0n);
    expect(stats.pnlPct).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.tradeCount).toBe(0);
  });
});

describe("walkTrades", () => {
  it("annotates each trade with its kind and realized PnL", () => {
    const trades: TradeRow[] = [
      trade({ sellCode: "XLM", sellIssuer: null, buyCode: "AQUA", buyIssuer: "GISSUER", sellAmount: 100_0000000n, buyAmount: 50_0000000n, tradedAt: new Date("2026-01-01T00:00:00Z") }),
      trade({ sellCode: "AQUA", sellIssuer: "GISSUER", buyCode: "XLM", buyIssuer: null, sellAmount: 50_0000000n, buyAmount: 150_0000000n, tradedAt: new Date("2026-01-02T00:00:00Z") }),
      trade({ sellCode: "AQUA", sellIssuer: "GISSUER", buyCode: "USDC", buyIssuer: "GUSDC", tradedAt: new Date("2026-01-03T00:00:00Z") }),
    ];

    const results = walkTrades(trades);

    expect(results.map((r) => r.kind)).toEqual(["entry", "exit", "skipped"]);
    expect(results[0]!.realizedPnlStroops).toBeNull();
    expect(results[1]!.realizedPnlStroops).toBe(50_0000000n);
    expect(results[2]!.realizedPnlStroops).toBeNull();
  });
});
