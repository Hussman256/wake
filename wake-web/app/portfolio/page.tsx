"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { ConnectGate } from "@/components/ConnectGate";
import { useWakeWebStore } from "@/lib/store";
import { mirrorLog, openPositions, seedFromString, tintFor, truncateAddress } from "@/lib/demo-data";

export default function PortfolioPage() {
  return (
    <ConnectGate>
      <Portfolio />
    </ConnectGate>
  );
}

function Portfolio() {
  const mirrors = useWakeWebStore((s) => s.mirrors);
  const removeMirror = useWakeWebStore((s) => s.removeMirror);
  const totalAllocated = mirrors.reduce((sum, m) => sum + m.allocatedUsd, 0);

  return (
    <div className="flex min-h-screen bg-wake-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-none flex-wrap items-end justify-between gap-6 border-b border-wake-line px-8 py-7">
          <div className="flex flex-wrap items-end gap-11">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">
                Allocated across mirrors
              </span>
              <span className="font-display text-[38px] leading-none tracking-[-.03em] sm:text-[52px]">
                {totalAllocated.toLocaleString()} XLM
              </span>
            </div>
            <div className="flex flex-col gap-2 pb-1.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">Live P&amp;L</span>
              <span className="font-display text-[22px] tracking-[-.02em] text-wake-ink-mute">
                Not wired up yet
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button className="h-10 rounded-[11px] border border-wake-line-strong px-[18px] text-sm transition-colors hover:bg-black/[.07]">
              Pause all
            </button>
            <Link
              href="/discover"
              className="flex h-10 items-center rounded-[11px] bg-wake-yellow px-5 text-sm font-semibold transition-transform hover:-translate-y-px"
            >
              Add mirror
            </Link>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_344px]">
          <div className="flex min-w-0 flex-col overflow-hidden px-8 pt-7">
            <span className="mb-4 font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">
              Active mirrors
            </span>
            <div className="mb-8 flex flex-col gap-3">
              {mirrors.length === 0 && (
                <div className="rounded-2xl border border-dashed border-wake-line-strong px-5 py-7 text-center text-sm text-wake-ink-mute">
                  No mirrors yet.{" "}
                  <Link href="/discover" className="underline">
                    Discover a wallet
                  </Link>{" "}
                  to set one up.
                </div>
              )}
              {mirrors.map((m) => {
                const seed = seedFromString(m.address);
                return (
                  <div
                    key={m.address}
                    className="grid grid-cols-2 items-center gap-4 rounded-2xl border border-wake-line-soft bg-black/[.04] px-5 py-4.5 transition-colors hover:border-wake-line-strong sm:grid-cols-[minmax(0,1.4fr)_110px_100px_minmax(0,1fr)_90px]"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="h-9 w-9 flex-none rounded-[11px]" style={{ background: tintFor(seed) }} />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-[14.5px] font-semibold">{m.alias ?? truncateAddress(m.address)}</span>
                        <span className="truncate font-mono text-[11px] text-wake-ink-mute">{truncateAddress(m.address)}</span>
                      </div>
                    </div>
                    <div className="hidden flex-col gap-1 sm:flex">
                      <span className="font-mono text-[10px] uppercase tracking-[.1em] text-wake-ink-mute">Allocated</span>
                      <span className="font-mono text-[13px]">{m.allocatedUsd.toLocaleString()} XLM</span>
                    </div>
                    <div className="hidden flex-col gap-1 sm:flex">
                      <span className="font-mono text-[10px] uppercase tracking-[.1em] text-wake-ink-mute">Max/trade</span>
                      <span className="font-display text-[17px] tracking-[-.01em]">{m.maxTradeUsd.toLocaleString()} XLM</span>
                    </div>
                    <div className="hidden min-w-0 flex-col gap-1.5 sm:flex">
                      <span className="font-mono text-[10px] uppercase tracking-[.1em] text-wake-ink-mute">Limits</span>
                      <span className="truncate font-mono text-[11px] text-wake-ink-soft">
                        {(m.slippageBps / 100).toFixed(1)}% slip · −{m.stopLossPct}% stop
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/mirror/${m.address}`} className="text-[12px] text-wake-ink-mute underline">
                        Edit
                      </Link>
                      <button onClick={() => removeMirror(m.address)} className="text-[12px] text-wake-red">
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="mb-4 font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">
              Open positions · illustrative
            </span>
            <div className="grid grid-cols-[minmax(0,1.2fr)_100px_100px_100px_90px] gap-4 border-b border-wake-line-strong px-1 pb-2.5 font-mono text-[10px] uppercase tracking-[.11em] text-wake-ink-mute">
              <span>Position</span>
              <span className="text-right">Size</span>
              <span className="text-right">Entry</span>
              <span className="text-right">Mark</span>
              <span className="text-right">P&amp;L</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {openPositions.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[minmax(0,1.2fr)_100px_100px_100px_90px] items-center gap-4 border-b border-wake-line-soft px-1 py-[15px] transition-colors hover:bg-black/[.04]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="h-2 w-2 flex-none rounded-full" style={{ background: p.tint }} />
                    <span className="font-mono text-[13px]">{p.pair}</span>
                    <span className="text-[11.5px] text-wake-ink-mute">via {p.via}</span>
                  </div>
                  <span className="text-right font-mono text-[12.5px] text-wake-ink-soft">{p.size}</span>
                  <span className="text-right font-mono text-[12.5px] text-wake-ink-mute">{p.entry}</span>
                  <span className="text-right font-mono text-[12.5px]">{p.mark}</span>
                  <span className="text-right font-mono text-[13px]" style={{ color: p.color }}>
                    {p.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col border-t border-wake-line xl:border-l xl:border-t-0">
            <div className="flex items-center gap-2.5 px-6.5 pb-3.5 pt-7">
              <div className="relative h-[7px] w-[7px] flex-none">
                <div className="absolute inset-0 rounded-full bg-wake-yellow" />
                <div className="wake-pulse-ring absolute inset-0 rounded-full bg-wake-yellow" />
              </div>
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">
                Mirror log · illustrative
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6.5 pb-6.5">
              {mirrorLog.map((g, i) => (
                <div key={i} className="flex gap-3 border-b border-wake-line-soft py-3.5">
                  <span className="w-11 flex-none pt-0.5 font-mono text-[11px] text-wake-ink-faint">{g.time}</span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-[13.5px] leading-snug" style={{ color: g.color }}>
                      {g.text}
                    </span>
                    <span className="font-mono text-[11px] text-wake-ink-mute">{g.meta}</span>
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
