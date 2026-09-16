import express from "express";
import { createPool } from "./db.js";

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
  const { rows } = await pool.query(`SELECT * FROM wallet_stats WHERE wallet = $1`, [req.params.address]);
  if (rows.length === 0) {
    res.status(404).json({ error: "not tracked" });
    return;
  }
  res.json(rows[0]);
});

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
