/**
 * Illustrative data for surfaces the real backend doesn't serve yet
 * (sparklines, equity curves, cohorts, live feed, mirror log). Ported from
 * the Wake Web App design's own demo dataset generator. Deterministic per
 * seed so a given wallet always renders the same shapes — swap in a real
 * time-series endpoint as wake-leaderboard grows one (tracked as a
 * good-first-issue).
 */

export const TEAL = "#04808C";
export const RED = "#B3261E";
export const LILAC = "#B7ACE8";
export const YELLOW = "#FDDA24";
export const WARM = "#5C5A50";
export const NAVY = "#002E5D";

export function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return (h >>> 0) / 0xffffffff;
}

export function sparkline(seed: number, points = 12, width = 104): string {
  const pts: string[] = [];
  let y = 20;
  for (let i = 0; i <= points; i++) {
    y = Math.max(3, Math.min(23, y + Math.sin(seed * (i + 1)) * 5 - 1.1));
    pts.push(((i * width) / points).toFixed(1) + "," + y.toFixed(1));
  }
  return pts.join(" ");
}

export interface EquityCurve {
  curve: string;
  curveArea: string;
  drawdown: string;
}

export function equityCurve(seed: number, days = 30): EquityCurve {
  const cp: string[] = [];
  const dp: string[] = [];
  let v = 120 + seed * 80;
  for (let i = 0; i <= days; i++) {
    v = Math.max(26, Math.min(200, v - 4.4 + Math.sin(i * 1.7 + seed * 10) * 13));
    const x = ((i * 1000) / days).toFixed(1);
    cp.push(x + "," + v.toFixed(1));
    dp.push(x + "," + Math.min(224, v + 22 + Math.abs(Math.cos(i * 0.9 + seed * 10)) * 14).toFixed(1));
  }
  return {
    curve: cp.join(" "),
    curveArea: cp.join(" ") + " 1000,232 0,232",
    drawdown: dp.join(" "),
  };
}

const TINTS = [TEAL, YELLOW, LILAC, NAVY, WARM];
export function tintFor(seed: number): string {
  return TINTS[Math.floor(seed * TINTS.length) % TINTS.length]!;
}

export const cohorts = [
  { name: "Conservative", count: "412 wallets", w: "68%", tint: TEAL },
  { name: "Balanced", count: "506 wallets", w: "84%", tint: YELLOW },
  { name: "Aggressive", count: "218 wallets", w: "36%", tint: LILAC },
  { name: "Unproven (< 30d)", count: "68 wallets", w: "12%", tint: "#C3BFB2" },
];

export const liveFeed = [
  { text: "Nadir Fund opened XLM/USDC · $14,200", ago: "12s ago", tint: YELLOW },
  { text: "Anchor Set closed EURC/USDC · +1.8%", ago: "1m ago", tint: TEAL },
  { text: "Quiet Whale added 220,000 XLM", ago: "4m ago", tint: NAVY },
  { text: "Slipstream 14 fills in 60s", ago: "6m ago", tint: LILAC },
  { text: "Perihelion exited yXLM/USDC · −0.4%", ago: "9m ago", tint: RED },
];

export function dossierStats(seed: number) {
  const win = Math.round(55 + seed * 30);
  const ret = (20 + seed * 30).toFixed(1);
  const dd = (6 + seed * 10).toFixed(1);
  return [
    { label: "Win rate", value: `${win}%`, color: "#14151A" },
    { label: "30d return", value: `+${ret}%`, color: TEAL },
    { label: "Max drawdown", value: `−${dd}%`, color: RED },
    { label: "Consistency", value: (0.6 + seed * 0.35).toFixed(2), color: "#14151A" },
    { label: "Avg hold", value: `${Math.round(6 + seed * 40)}h`, color: "#14151A" },
  ];
}

export interface PreviewTrade {
  pair: string;
  theirsXlm: number;
}

/** Deterministic per-wallet sample of recent trade sizes (in XLM), used to
 * preview how a mirror config would have sized against them. Real
 * historical simulation against this wallet's actual fills is a good
 * follow-up once wake-leaderboard exposes per-asset price history. */
export function mirrorPreviewSample(seed: number): PreviewTrade[] {
  const pairs = ["AQUA/USDC", "XLM/USDC", "yXLM/XLM", "EURC/USDC", "AQUA/XLM"];
  return pairs.map((pair, i) => ({
    pair,
    theirsXlm: Math.round(200 + seed * 4000 * ((i % 3) + 1) * 0.6),
  }));
}

export const mirrorLog = [
  { time: "09:41", text: "Mirrored AQUA/USDC · $420.00", meta: "Steady Orbit · filled in 3.8s · fee 0.00001 XLM", color: "#14151A" },
  { time: "09:38", text: "Skipped XLM/EURC · slippage 0.9% > 0.5%", meta: "Anchor Set · no funds moved", color: RED },
  { time: "09:22", text: "Mirrored EURC/USDC · $310.00", meta: "Anchor Set · filled in 2.1s", color: "#14151A" },
  { time: "08:57", text: "Exit mirrored · yXLM/XLM closed", meta: "Steady Orbit · +$8.20 realised", color: TEAL },
  { time: "08:40", text: "Slipstream paused · drawdown budget 76%", meta: "Auto-guard · resumes on your approval", color: YELLOW },
  { time: "08:12", text: "Mirrored SHX/USDC · $118.00", meta: "Slipstream · filled in 5.4s", color: "#14151A" },
  { time: "07:55", text: "Skipped AQUA/XLM · above per-trade cap", meta: "Steady Orbit · logged only", color: "#6E6C62" },
  { time: "07:31", text: "Mirrored XLM/USDC · $260.00", meta: "Anchor Set · filled in 2.9s", color: "#14151A" },
  { time: "07:04", text: "Signature declined in wallet", meta: "Steady Orbit · trade abandoned", color: "#6E6C62" },
  { time: "06:48", text: "Mirror health check passed", meta: "All 3 mirrors within limits", color: TEAL },
];

export const openPositions = [
  { pair: "AQUA/USDC", via: "Steady Orbit", size: "9,412", entry: "0.0446", mark: "0.0461", pnl: "+$14.10", color: TEAL, tint: LILAC },
  { pair: "EURC/USDC", via: "Anchor Set", size: "2,400", entry: "1.0842", mark: "1.0901", pnl: "+$14.16", color: TEAL, tint: "#04808C" },
  { pair: "XLM/USDC", via: "Anchor Set", size: "18,200", entry: "0.1284", mark: "0.1272", pnl: "−$21.84", color: RED, tint: "#04808C" },
  { pair: "SHX/USDC", via: "Slipstream", size: "54,000", entry: "0.0021", mark: "0.0022", pnl: "+$5.40", color: TEAL, tint: YELLOW },
];

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
