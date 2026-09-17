"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { ConnectGate } from "@/components/ConnectGate";
import { Sparkline } from "@/components/Sparkline";
import { useWakeWebStore } from "@/lib/store";
import { fetchTraders, type Trader } from "@/lib/leaderboard-api";
import { fetchXlmBalance } from "@/lib/horizon";
import { cohorts, liveFeed } from "@/lib/demo-data";

const FILTERS = ["30d return", "Win rate", "Consistency", "Drawdown"];

export default function DiscoverPage() {
  return (
    <ConnectGate>
      <Discover />
    </ConnectGate>
  );
}

function Discover() {
  const wallet = useWakeWebStore((s) => s.wallet);
  const [traders, setTraders] = useState<Trader[] | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchTraders().then(({ traders, isDemo }) => {
      setTraders(traders);
      setIsDemo(isDemo);
    });
  }, []);

  useEffect(() => {
    if (wallet) fetchXlmBalance(wallet.address).then(setBalance);
  }, [wallet]);

  return (
    <div className="flex min-h-screen bg-wake-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-5 border-b border-wake-line px-8 py-5">
          <div className="flex h-10 max-w-[420px] flex-1 items-center gap-3 rounded-[11px] border border-wake-line bg-black/[.05] px-3.5">
            <div className="h-3 w-3 rounded-full border-[1.6px] border-wake-ink-mute" />
            <span className="text-[13.5px] text-wake-ink-mute">Search wallet, alias, or asset pair</span>
            <span className="ml-auto font-mono text-[11px] text-wake-ink-faint">⌘K</span>
          </div>
          <div className="ml-auto flex items-center gap-[18px]">
            <span className="font-mono text-[11.5px] text-wake-ink-mute">Testnet</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[.1em] text-wake-ink-mute">XLM</span>
              <span className="font-display text-[19px]">{balance === null ? "—" : balance.toLocaleString()}</span>
            </div>
            <div className="h-[34px] w-[34px] rounded-full bg-wake-lilac" />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_316px]">
          <div className="flex min-w-0 flex-col px-8 pt-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2.5">
                <h1 className="font-display text-[36px] font-medium tracking-[-.025em] sm:text-[44px]">Discover traders</h1>
                <span className="text-sm text-wake-ink-mute">
                  {traders ? traders.length : "…"} wallets scored on 90 days of on-chain history
                  {isDemo ? " · illustrative data" : " · live from wake-leaderboard"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-[15px] py-[9px] text-[13px] transition-colors ${
                      filter === f ? "bg-wake-yellow font-semibold text-wake-ink" : "border border-wake-line-strong text-wake-ink-soft"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[34px_minmax(0,1.5fr)_96px_72px_72px_84px_104px_74px] items-center gap-4 border-b border-wake-line-strong px-2 pb-3 font-mono text-[10.5px] uppercase tracking-[.11em] text-wake-ink-mute">
              <span>#</span>
              <span>Wallet</span>
              <span className="text-right">30d</span>
              <span className="text-right">Win</span>
              <span className="text-right">Trades</span>
              <span className="text-right">AUM</span>
              <span>Shape</span>
              <span />
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              {(traders ?? Array.from({ length: 8 })).map((t, i) => (
                <TraderRow key={t ? (t as Trader).wallet : i} trader={t as Trader | undefined} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 border-t border-wake-line px-7 py-8 xl:border-l xl:border-t-0">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">Cohorts</span>
              {cohorts.map((c) => (
                <div key={c.name} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm">{c.name}</span>
                    <span className="font-mono text-[11.5px] text-wake-ink-mute">{c.count}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-black/[.09]">
                    <div className="h-full rounded-full" style={{ width: c.w, background: c.tint }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">Live on the network</span>
              {liveFeed.map((f, i) => (
                <div key={i} className="flex gap-3 border-b border-wake-line-soft py-3">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full" style={{ background: f.tint }} />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-[13.5px] leading-snug">{f.text}</span>
                    <span className="font-mono text-[11px] text-wake-ink-mute">{f.ago}</span>
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

function TraderRow({ trader }: { trader?: Trader }) {
  if (!trader) {
    return <div className="h-[64px] animate-pulse border-b border-wake-line-soft bg-black/[.02]" />;
  }

  return (
    <div className="grid grid-cols-[34px_minmax(0,1.5fr)_96px_72px_72px_84px_104px_74px] items-center gap-4 border-b border-wake-line-soft px-2 py-[15px] transition-colors hover:bg-black/[.045]">
      <span className="font-mono text-[12.5px] text-wake-ink-mute">{trader.rank}</span>
      <Link href={`/discover/${trader.wallet}`} className="flex min-w-0 items-center gap-3.5 text-wake-ink">
        <div className="h-[34px] w-[34px] flex-none rounded-[10px]" style={{ background: trader.tint }} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[14.5px] font-semibold">{trader.alias}</span>
          <span className="truncate font-mono text-[11.5px] text-wake-ink-mute">
            {trader.addr} · {trader.style}
          </span>
        </div>
      </Link>
      <span className="text-right font-display text-[21px] tracking-[-.01em] text-wake-teal">{trader.ret}</span>
      <span className="text-right font-mono text-[13px]">{trader.win}</span>
      <span className="text-right font-mono text-[13px] text-wake-ink-soft">{trader.trades}</span>
      <span className="text-right font-mono text-[13px] text-wake-ink-soft">{trader.aum}</span>
      <Sparkline points={trader.spark} />
      <Link
        href={`/mirror/${trader.wallet}`}
        className="flex h-[34px] items-center justify-center rounded-[9px] border border-wake-line-strong text-[13px] font-medium transition-colors hover:border-wake-yellow hover:bg-wake-yellow"
      >
        Mirror
      </Link>
    </div>
  );
}
