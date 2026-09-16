import { Horizon } from "@stellar/stellar-sdk";
import { createPool } from "./db.js";
import { computeWalletStats, type TradeRow } from "./pnl.js";

const HORIZON_URL = process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const PNL_WINDOW_DAYS = 30;

interface OperationLike {
  type: string;
  transaction_hash: string;
  created_at: string;
  source_asset_type?: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
  source_amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  amount?: string;
  paging_token: string;
}

function toStroops(amount: string): bigint {
  return BigInt(Math.round(Number(amount) * 1e7));
}

async function fetchAndStoreTrades(horizon: Horizon.Server, pool: Awaited<ReturnType<typeof createPool>>, wallet: string) {
  const page = await horizon
    .operations()
    .forAccount(wallet)
    .order("desc")
    .limit(200)
    .call();

  for (const raw of page.records as unknown as OperationLike[]) {
    if (raw.type !== "path_payment_strict_send" && raw.type !== "path_payment_strict_receive") continue;
    if (!raw.source_asset_type || !raw.asset_type) continue;

    const sellCode = raw.source_asset_type === "native" ? "XLM" : (raw.source_asset_code ?? "");
    const sellIssuer = raw.source_asset_type === "native" ? null : (raw.source_asset_issuer ?? null);
    const buyCode = raw.asset_type === "native" ? "XLM" : (raw.asset_code ?? "");
    const buyIssuer = raw.asset_type === "native" ? null : (raw.asset_issuer ?? null);

    await pool.query(
      `INSERT INTO trades (wallet, dex, tx_hash, sell_code, sell_issuer, buy_code, buy_issuer, sell_amount, buy_amount, traded_at)
       VALUES ($1, 'aquarius', $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (wallet, tx_hash) DO NOTHING`,
      [
        wallet,
        raw.transaction_hash,
        sellCode,
        sellIssuer,
        buyCode,
        buyIssuer,
        toStroops(raw.source_amount ?? "0").toString(),
        toStroops(raw.amount ?? "0").toString(),
        raw.created_at,
      ],
    );
  }
}

async function refreshStats(pool: Awaited<ReturnType<typeof createPool>>, wallet: string) {
  const since = new Date(Date.now() - PNL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const { rows } = await pool.query(
    `SELECT sell_code, sell_issuer, buy_code, buy_issuer, sell_amount, buy_amount, traded_at
     FROM trades WHERE wallet = $1 AND traded_at >= $2`,
    [wallet, since],
  );

  const trades: TradeRow[] = rows.map((r) => ({
    sellCode: r.sell_code,
    sellIssuer: r.sell_issuer,
    buyCode: r.buy_code,
    buyIssuer: r.buy_issuer,
    sellAmount: BigInt(r.sell_amount),
    buyAmount: BigInt(r.buy_amount),
    tradedAt: r.traded_at,
  }));

  const stats = computeWalletStats(trades);
  const { rows: followerRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM followers WHERE followed_wallet = $1`,
    [wallet],
  );

  await pool.query(
    `INSERT INTO wallet_stats (wallet, pnl_30d_stroops, pnl_30d_pct, win_rate, trade_count_30d, follower_count, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (wallet) DO UPDATE SET
       pnl_30d_stroops = EXCLUDED.pnl_30d_stroops,
       pnl_30d_pct = EXCLUDED.pnl_30d_pct,
       win_rate = EXCLUDED.win_rate,
       trade_count_30d = EXCLUDED.trade_count_30d,
       follower_count = EXCLUDED.follower_count,
       updated_at = now()`,
    [wallet, stats.realizedPnlStroops.toString(), stats.pnlPct, stats.winRate, stats.tradeCount, followerRows[0]?.count ?? 0],
  );
}

export async function runOnce() {
  const pool = createPool();
  const horizon = new Horizon.Server(HORIZON_URL);
  try {
    const { rows } = await pool.query(`SELECT address FROM tracked_wallets`);
    for (const { address } of rows as { address: string }[]) {
      await fetchAndStoreTrades(horizon, pool, address);
      await refreshStats(pool, address);
    }
    console.log(`[wake-leaderboard] refreshed ${rows.length} tracked wallets`);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOnce().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
