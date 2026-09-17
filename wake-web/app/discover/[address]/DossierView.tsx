"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { ConnectGate } from "@/components/ConnectGate";
import { EquityChart } from "@/components/EquityChart";
import { fetchWalletStats, fetchWalletTrades, type LeaderboardEntry, type TradeEntry } from "@/lib/leaderboard-api";
import { dossierStats, equityCurve, seedFromString, tintFor, truncateAddress } from "@/lib/demo-data";

const TIMEFRAMES = ["7d", "30d", "90d"] as const;

export function DossierView({ address }: { address: string }) {
  return (
    <ConnectGate>
      <Dossier address={address} />
    </ConnectGate>
  );
}

function Dossier({ address }: { address: string }) {
  const [stats, setStats] = useState<LeaderboardEntry | null>(null);
  const [trades, setTrades] = useState<TradeEntry[] | null>(null);
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("90d");

  useEffect(() => {
    fetchWalletStats(address).then(setStats);
    fetchWalletTrades(address).then((t) => setTrades(t.length ? t : demoLedger));
  }, [address]);

  const seed = useMemo(() => seedFromString(address), [address]);
  const tint = tintFor(seed);
  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
  const curve = useMemo(() => equityCurve(seed, days), [seed, days]);
  const alias = stats?.label ?? `Wallet ${truncateAddress(address)}`;
  const stat = stats
    ? [
        { label: "Win rate", value: `${Math.round(stats.win_rate * 100)}%`, color: "#14151A" },
        { label: "30d return", value: `${stats.pnl_30d_pct >= 0 ? "+" : ""}${(stats.pnl_30d_pct * 100).toFixed(1)}%`, color: "#04808C" },
        { label: "Trades (30d)", value: String(stats.trade_count_30d), color: "#14151A" },
        { label: "Followers", value: String(stats.follower_count), color: "#14151A" },
      ].concat(dossierStats(seed).slice(2, 3))
    : dossierStats(seed);

  return (
    <div className="flex min-h-screen bg-wake-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-4 border-b border-wake-line px-8 py-5">
          <Link
            href="/discover"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-wake-line-strong text-sm text-wake-ink-soft"
          >
            ←
          </Link>
          <span className="font-mono text-[11.5px] tracking-[.08em] text-wake-ink-mute">
            DISCOVER / {alias.toUpperCase()} / {truncateAddress(address)}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button className="h-10 rounded-[11px] border border-wake-line-strong px-[18px] text-sm transition-colors hover:bg-black/[.07]">
              Watch
            </button>
            <Link
              href={`/mirror/${address}`}
              className="flex h-10 items-center rounded-[11px] bg-wake-yellow px-[22px] text-sm font-semibold transition-transform hover:-translate-y-px"
            >
              Mirror this wallet
            </Link>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col px-8 pt-8">
            <div className="mb-6 flex items-center gap-5">
              <div className="h-[62px] w-[62px] flex-none rounded-[18px]" style={{ background: tint }} />
              <div className="flex flex-col gap-1.5">
                <h1 className="font-display text-[32px] font-medium tracking-[-.025em] sm:text-[40px]">{alias}</h1>
                <div className="flex flex-wrap items-center gap-3.5">
                  <span className="font-mono text-[12.5px] text-wake-ink-mute">{truncateAddress(address)}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-wake-teal/40 bg-wake-teal/10 px-[11px] py-[5px]">
                    <span className="h-[5px] w-[5px] rounded-full bg-wake-teal" />
                    <span className="text-[11.5px] font-medium text-wake-teal-dark">Verified on-chain</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-px bg-wake-line sm:grid-cols-5">
              {stat.map((s) => (
                <div key={s.label} className="flex flex-col gap-1.5 bg-wake-surface px-[18px] py-[18px]">
                  <span className="font-mono text-[10px] uppercase tracking-[.1em] text-wake-ink-mute">{s.label}</span>
                  <span className="font-display text-[26px] tracking-[-.02em] sm:text-[30px]" style={{ color: s.color }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-3.5 flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">
                Equity curve · {timeframe}
              </span>
              <div className="flex gap-1.5 font-mono text-[11px]">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`rounded-md px-2.5 py-1 ${timeframe === tf ? "bg-black/[.09] text-wake-ink" : "text-wake-ink-mute"}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <EquityChart curve={curve.curve} curveArea={curve.curveArea} drawdown={curve.drawdown} />
            <div className="flex items-center gap-6 font-mono text-[11px] text-wake-ink-mute">
              <span className="flex items-center gap-2">
                <span className="h-[2px] w-3.5 bg-wake-teal" /> Equity
              </span>
              <span className="flex items-center gap-2">
                <span className="h-[2px] w-3.5 bg-wake-lilac" /> Drawdown envelope
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-col border-t border-wake-line xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between px-7 pb-3.5 pt-7">
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">Trade ledger</span>
              <span className="font-mono text-[11px] text-wake-ink-faint">{trades?.length ?? "…"} shown</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7">
              {(trades ?? []).map((l, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border-b border-wake-line-soft py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-mono text-[13px]">{l.pair}</span>
                    <span className="font-mono text-[11px] text-wake-ink-mute">
                      {l.side} · {l.size}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[13px]" style={{ color: l.color }}>
                      {l.pnl}
                    </span>
                    <span className="font-mono text-[11px] text-wake-ink-mute">{l.ago}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const demoLedger: TradeEntry[] = [
  { pair: "AQUA/USDC", side: "Buy", size: "9,412", pnl: "+3.4%", ago: "2h", color: "#04808C" },
  { pair: "XLM/USDC", side: "Sell", size: "18,200", pnl: "+1.1%", ago: "6h", color: "#04808C" },
  { pair: "yXLM/XLM", side: "Buy", size: "4,010", pnl: "−0.6%", ago: "11h", color: "#B3261E" },
  { pair: "EURC/USDC", side: "Sell", size: "2,400", pnl: "+0.9%", ago: "1d", color: "#04808C" },
  { pair: "AQUA/XLM", side: "Buy", size: "26,700", pnl: "+5.2%", ago: "1d", color: "#04808C" },
];
