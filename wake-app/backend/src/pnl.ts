export interface TradeRow {
  sellCode: string;
  sellIssuer: string | null;
  buyCode: string;
  buyIssuer: string | null;
  sellAmount: bigint;
  buyAmount: bigint;
  tradedAt: Date;
}

export interface WalletStats {
  realizedPnlStroops: bigint;
  pnlPct: number;
  winRate: number;
  tradeCount: number;
}

export interface TradeResult extends TradeRow {
  /** "entry" (bought with XLM, no realized PnL yet), "exit" (sold for XLM,
   * realized PnL known), or "skipped" (asset-to-asset, or an exit with no
   * prior recorded entry to compare against). */
  kind: "entry" | "exit" | "skipped";
  realizedPnlStroops: bigint | null;
}

const REFERENCE_ASSET = "XLM";

/**
 * Walks trades in chronological order, tracking each asset's position via
 * weighted-average cost basis in XLM stroops, and annotates every trade
 * with its realized PnL (exits only). Only trades where one leg is XLM are
 * treated as entries/exits — asset-to-asset swaps (e.g. AQUA -> USDC) don't
 * touch a position's XLM cost basis directly and are skipped for v1.
 * Aquarius's highest-volume pairs are XLM-denominated, so this covers the
 * common case; broadening it to a full multi-asset ledger is a good
 * follow-up issue.
 */
export function walkTrades(trades: TradeRow[]): TradeResult[] {
  const sorted = [...trades]
    .map((t, i) => ({ t, i }))
    .sort((a, b) => a.t.tradedAt.getTime() - b.t.tradedAt.getTime() || a.i - b.i);

  // asset code -> { units held, total cost basis in XLM stroops }
  const positions = new Map<string, { units: bigint; costBasis: bigint }>();
  const results: TradeResult[] = [];

  for (const { t: trade } of sorted) {
    const buyingXlm = trade.buyCode === REFERENCE_ASSET;
    const sellingXlm = trade.sellCode === REFERENCE_ASSET;

    if (!buyingXlm && !sellingXlm) {
      results.push({ ...trade, kind: "skipped", realizedPnlStroops: null });
      continue;
    }

    if (sellingXlm) {
      // Entry: buying `buyCode` with XLM.
      const key = assetKey(trade.buyCode, trade.buyIssuer);
      const pos = positions.get(key) ?? { units: 0n, costBasis: 0n };
      pos.units += trade.buyAmount;
      pos.costBasis += trade.sellAmount;
      positions.set(key, pos);
      results.push({ ...trade, kind: "entry", realizedPnlStroops: null });
      continue;
    }

    // Exit: selling `sellCode` for XLM.
    const key = assetKey(trade.sellCode, trade.sellIssuer);
    const pos = positions.get(key);
    if (!pos || pos.units <= 0n) {
      results.push({ ...trade, kind: "skipped", realizedPnlStroops: null });
      continue;
    }

    const unitsSold = trade.sellAmount > pos.units ? pos.units : trade.sellAmount;
    const avgCostPerUnit = pos.costBasis / pos.units; // stroops per unit, integer-truncated
    const costOfSold = avgCostPerUnit * unitsSold;
    const proceeds = trade.buyAmount;
    const pnl = proceeds - costOfSold;

    pos.units -= unitsSold;
    pos.costBasis -= costOfSold;
    positions.set(key, pos);

    results.push({ ...trade, kind: "exit", realizedPnlStroops: pnl });
  }

  return results;
}

export function computeWalletStats(trades: TradeRow[]): WalletStats {
  const results = walkTrades(trades);

  let realizedPnlStroops = 0n;
  let totalCostOfExits = 0n;
  let wins = 0;
  let realizedTrades = 0;

  for (const r of results) {
    if (r.kind !== "exit" || r.realizedPnlStroops === null) continue;
    realizedPnlStroops += r.realizedPnlStroops;
    totalCostOfExits += r.buyAmount - r.realizedPnlStroops; // cost of the units sold
    realizedTrades += 1;
    if (r.realizedPnlStroops > 0n) wins += 1;
  }

  const pnlPct = totalCostOfExits > 0n ? Number(realizedPnlStroops) / Number(totalCostOfExits) : 0;
  const winRate = realizedTrades > 0 ? wins / realizedTrades : 0;

  return {
    realizedPnlStroops,
    pnlPct,
    winRate,
    tradeCount: trades.length,
  };
}

function assetKey(code: string, issuer: string | null): string {
  return issuer ? `${code}:${issuer}` : code;
}
