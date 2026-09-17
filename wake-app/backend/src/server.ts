import express from "express";
import { createPool } from "./db.js";
import { walkTrades, type TradeRow } from "./pnl.js";

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(express.json());

const pool = createPool();

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/leaderboard", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 25), 100);
  const { rows } = await pool.query(
    `SELECT w.wallet, w.pnl_30d_pct, w.win_rate, w.follower_count, w.trade_count_30d, t.label
     FROM wallet_stats w
     JOIN tracked_wallets t ON t.address = w.wallet
     ORDER BY w.pnl_30d_pct DESC
     LIMIT $1`,
    [limit],
  );
  res.json({ wallets: rows });
});

app.get("/wallets/:address", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT w.*, t.label FROM wallet_stats w
     JOIN tracked_wallets t ON t.address = w.wallet
     WHERE w.wallet = $1`,
    [req.params.address],
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "not tracked" });
    return;
  }
  res.json(rows[0]);
});

app.get("/wallets/:address/trades", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const { rows } = await pool.query(
    `SELECT sell_code, sell_issuer, buy_code, buy_issuer, sell_amount, buy_amount, traded_at
     FROM trades WHERE wallet = $1 ORDER BY traded_at DESC LIMIT $2`,
    [req.params.address, limit],
  );

  const tradeRows: TradeRow[] = rows.map((r) => ({
    sellCode: r.sell_code,
    sellIssuer: r.sell_issuer,
    buyCode: r.buy_code,
    buyIssuer: r.buy_issuer,
    sellAmount: BigInt(r.sell_amount),
    buyAmount: BigInt(r.buy_amount),
    tradedAt: r.traded_at,
  }));

  const results = walkTrades(tradeRows)
    .sort((a, b) => b.tradedAt.getTime() - a.tradedAt.getTime())
    .map((r) => ({
      pair: `${r.sellCode}/${r.buyCode}`,
      side: r.kind === "entry" ? "Buy" : r.kind === "exit" ? "Sell" : "Swap",
      size: formatAmount(r.sellCode === "XLM" ? r.buyAmount : r.sellAmount),
      pnl: formatPnl(r.realizedPnlStroops, r.buyAmount),
      ago: relativeTime(r.tradedAt),
      color: r.realizedPnlStroops === null ? "#14151A" : r.realizedPnlStroops >= 0n ? "#04808C" : "#B3261E",
    }));

  res.json({ trades: results });
});

function formatAmount(stroops: bigint): string {
  return (Number(stroops) / 1e7).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatPnl(realizedPnlStroops: bigint | null, buyAmount: bigint): string {
  if (realizedPnlStroops === null) return "—";
  const costBasis = buyAmount - realizedPnlStroops;
  if (costBasis <= 0n) return "—";
  const pct = (Number(realizedPnlStroops) / Number(costBasis)) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function relativeTime(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

app.post("/wallets/:address/follow", async (req, res) => {
  const followerWallet = req.body?.followerWallet as string | undefined;
  if (!followerWallet) {
    res.status(400).json({ error: "followerWallet is required" });
    return;
  }
  await pool.query(
    `INSERT INTO tracked_wallets (address) VALUES ($1) ON CONFLICT DO NOTHING`,
    [req.params.address],
  );
  await pool.query(
    `INSERT INTO followers (followed_wallet, follower_wallet) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.params.address, followerWallet],
  );
  res.status(201).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[wake-leaderboard] listening on :${PORT}`);
});
