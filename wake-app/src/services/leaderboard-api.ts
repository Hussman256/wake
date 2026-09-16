export interface LeaderboardEntry {
  wallet: string;
  label: string | null;
  pnl_30d_pct: number;
  win_rate: number;
  follower_count: number;
  trade_count_30d: number;
}

const BASE_URL = process.env.EXPO_PUBLIC_LEADERBOARD_API_URL ?? "http://localhost:3001";

export async function fetchLeaderboard(limit = 25): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/leaderboard?limit=${limit}`);
  if (!res.ok) throw new Error(`Leaderboard request failed: ${res.status}`);
  const data = (await res.json()) as { wallets: LeaderboardEntry[] };
  return data.wallets;
}

export async function fetchWalletStats(address: string): Promise<LeaderboardEntry> {
  const res = await fetch(`${BASE_URL}/wallets/${address}`);
  if (!res.ok) throw new Error(`Wallet stats request failed: ${res.status}`);
  return (await res.json()) as LeaderboardEntry;
}

export async function registerFollow(address: string, followerWallet: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/wallets/${address}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerWallet }),
  });
  if (!res.ok) throw new Error(`Follow registration failed: ${res.status}`);
}
