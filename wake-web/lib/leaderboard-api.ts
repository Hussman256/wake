import { seedFromString, sparkline, tintFor, truncateAddress } from "./demo-data";

export interface LeaderboardEntry {
  wallet: string;
  label: string | null;
  pnl_30d_pct: number;
  win_rate: number;
  follower_count: number;
  trade_count_30d: number;
}

export interface Trader {
  rank: number;
  alias: string;
  wallet: string;
  addr: string;
  ret: string;
  win: string;
  trades: string;
  aum: string;
  tint: string;
  style: string;
  spark: string;
}

export interface TradeEntry {
  pair: string;
  side: string;
  size: string;
  pnl: string;
  ago: string;
  color: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_LEADERBOARD_API_URL ?? "http://localhost:3001";

const DEMO_STYLES = [
  "swing · AQUA/USDC",
  "momentum · XLM pairs",
  "market making",
  "low frequency",
  "mean reversion",
  "stable arbitrage",
  "high frequency",
  "yield rotation",
];

const DEMO_AUM = ["$1.2M", "$840K", "$3.4M", "$5.1M", "$610K", "$2.2M", "$430K", "$980K"];

const DEMO_WALLETS = [
  "GD4F0000000000000000000000000000000000000000000000007A21",
  "GA9K0000000000000000000000000000000000000000000000003C08",
  "GB2X0000000000000000000000000000000000000000000000009E55",
  "GC7P0000000000000000000000000000000000000000000000001D42",
  "GD1M0000000000000000000000000000000000000000000000006B70",
  "GE8T0000000000000000000000000000000000000000000000004F19",
  "GF3R0000000000000000000000000000000000000000000000008A62",
  "GG6W0000000000000000000000000000000000000000000000002C31",
];

const DEMO_ALIASES = [
  "Steady Orbit",
  "Lumen Dust",
  "Nadir Fund",
  "Quiet Whale",
  "Perihelion",
  "Anchor Set",
  "Slipstream",
  "Ballast",
];

function demoTraders(): Trader[] {
  return DEMO_WALLETS.map((addr, i) => {
    const seed = seedFromString(addr);
    return {
      rank: i + 1,
      alias: DEMO_ALIASES[i]!,
      wallet: addr,
      addr: truncateAddress(addr),
      ret: `+${(40.2 - i * 4.3).toFixed(1)}%`,
      win: `${Math.round(75 - i * 1.8)}%`,
      trades: String(Math.round(100 + seed * 350)),
      aum: DEMO_AUM[i]!,
      tint: tintFor(seed),
      style: DEMO_STYLES[i]!,
      spark: sparkline(0.7 + i * 0.31),
    };
  });
}

function toTrader(entry: LeaderboardEntry, rank: number): Trader {
  const seed = seedFromString(entry.wallet);
  return {
    rank,
    alias: entry.label ?? truncateAddress(entry.wallet),
    wallet: entry.wallet,
    addr: truncateAddress(entry.wallet),
    ret: `${entry.pnl_30d_pct >= 0 ? "+" : ""}${(entry.pnl_30d_pct * 100).toFixed(1)}%`,
    win: `${Math.round(entry.win_rate * 100)}%`,
    trades: String(entry.trade_count_30d),
    aum: "—",
    tint: tintFor(seed),
    style: `${entry.follower_count} followers`,
    spark: sparkline(0.7 + seed * 0.6),
  };
}

export async function fetchTraders(limit = 25): Promise<{ traders: Trader[]; isDemo: boolean }> {
  try {
    const res = await fetch(`${BASE_URL}/leaderboard?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = (await res.json()) as { wallets: LeaderboardEntry[] };
    if (!data.wallets.length) return { traders: demoTraders(), isDemo: true };
    return { traders: data.wallets.map(toTrader), isDemo: false };
  } catch {
    return { traders: demoTraders(), isDemo: true };
  }
}

export async function fetchWalletStats(address: string): Promise<LeaderboardEntry | null> {
  try {
    const res = await fetch(`${BASE_URL}/wallets/${address}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as LeaderboardEntry;
  } catch {
    return null;
  }
}

export async function fetchWalletTrades(address: string, limit = 20): Promise<TradeEntry[]> {
  try {
    const res = await fetch(`${BASE_URL}/wallets/${address}/trades?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = (await res.json()) as { trades: TradeEntry[] };
    return data.trades;
  } catch {
    return [];
  }
}

export async function registerFollow(address: string, followerWallet: string): Promise<void> {
  await fetch(`${BASE_URL}/wallets/${address}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerWallet }),
  }).catch(() => {});
}
