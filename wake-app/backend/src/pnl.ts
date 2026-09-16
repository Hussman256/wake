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

const REFERENCE_ASSET = "XLM";

/**
 * Realized PnL via weighted-average cost basis, denominated in the
 * reference asset (XLM). Only trades where one leg is XLM are counted as
 * entries/exits — asset-to-asset swaps (e.g. AQUA -> USDC) don't touch a
 * position's XLM cost basis directly and are skipped for v1. Aquarius's
 * highest-volume pairs are XLM-denominated, so this covers the common case;
 * broadening it to a full multi-asset ledger is a good follow-up issue.
 */
export function computeWalletStats(trades: TradeRow[]): WalletStats {
  const sorted = [...trades].sort((a, b) => a.tradedAt.getTime() - b.tradedAt.getTime());

  // asset code -> { units held, total cost basis in XLM stroops }
  const positions = new Map<string, { units: bigint; costBasis: bigint }>();

  let realizedPnlStroops = 0n;
  let totalCostOfExits = 0n;
  let wins = 0;
  let realizedTrades = 0;

  for (const trade of sorted) {
    const buyingXlm = trade.buyCode === REFERENCE_ASSET;
    const sellingXlm = trade.sellCode === REFERENCE_ASSET;
    if (!buyingXlm && !sellingXlm) continue; // asset-to-asset, skipped in v1

    if (sellingXlm) {
      // Entry: buying `buyCode` with XLM.
      const key = assetKey(trade.buyCode, trade.buyIssuer);
      const pos = positions.get(key) ?? { units: 0n, costBasis: 0n };
      pos.units += trade.buyAmount;
      pos.costBasis += trade.sellAmount;
      positions.set(key, pos);
      continue;
    }

    // Exit: selling `sellCode` for XLM.
    const key = assetKey(trade.sellCode, trade.sellIssuer);
    const pos = positions.get(key);
    if (!pos || pos.units <= 0n) continue; // selling something we never saw bought; no cost basis to compare against

    const unitsSold = trade.sellAmount > pos.units ? pos.units : trade.sellAmount;
    const avgCostPerUnit = pos.costBasis / pos.units; // stroops per unit, integer-truncated
    const costOfSold = avgCostPerUnit * unitsSold;
    const proceeds = trade.buyAmount;
    const pnl = proceeds - costOfSold;

    realizedPnlStroops += pnl;
    totalCostOfExits += costOfSold;
    realizedTrades += 1;
    if (pnl > 0n) wins += 1;

    pos.units -= unitsSold;
    pos.costBasis -= costOfSold;
    positions.set(key, pos);
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
