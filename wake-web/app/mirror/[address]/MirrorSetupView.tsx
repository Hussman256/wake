"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ConnectGate } from "@/components/ConnectGate";
import { SignModal, type SignRow } from "@/components/SignModal";
import { useWakeWebStore } from "@/lib/store";
import { fetchWalletStats, type LeaderboardEntry } from "@/lib/leaderboard-api";
import { fetchXlmBalance } from "@/lib/horizon";
import { mirrorPreviewSample, seedFromString, truncateAddress } from "@/lib/demo-data";

const SLIPPAGE_OPTIONS = [10, 50, 100]; // bps

export function MirrorSetupView({ address }: { address: string }) {
  return (
    <ConnectGate>
      <MirrorSetup address={address} />
    </ConnectGate>
  );
}

function MirrorSetup({ address }: { address: string }) {
  const wallet = useWakeWebStore((s) => s.wallet);
  const upsertMirror = useWakeWebStore((s) => s.upsertMirror);

  const [stats, setStats] = useState<LeaderboardEntry | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [allocated, setAllocated] = useState(0);
  const [maxTrade, setMaxTrade] = useState(0);
  const [slippageBps, setSlippageBps] = useState(50);
  const [stopLossPct, setStopLossPct] = useState(15);
  const [copyExits, setCopyExits] = useState(true);
  const [showSign, setShowSign] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signResult, setSignResult] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletStats(address).then(setStats);
  }, [address]);

  useEffect(() => {
    if (!wallet) return;
    fetchXlmBalance(wallet.address).then((b) => {
      setBalance(b);
      if (b) {
        setAllocated(Math.round(b * 0.34));
        setMaxTrade(Math.round(b * 0.34 * 0.2));
      }
    });
  }, [wallet]);

  const seed = useMemo(() => seedFromString(address), [address]);
  const alias = stats?.label ?? `Wallet ${truncateAddress(address)}`;
  const preview = useMemo(() => mirrorPreviewSample(seed), [seed]);
  const allocPct = balance ? Math.min(100, Math.round((allocated / balance) * 100)) : 0;
  const maxTradePct = allocated ? Math.min(100, Math.round((maxTrade / allocated) * 100)) : 0;

  const estReturn = useMemo(
    () => preview.reduce((sum, p) => sum + Math.min(p.theirsXlm, maxTrade) * 0.014, 0),
    [preview, maxTrade],
  );
  const worstDay = useMemo(
    () => preview.reduce((sum, p) => sum + Math.min(p.theirsXlm, maxTrade) * 0.006, 0),
    [preview, maxTrade],
  );

  const handleReviewAndSign = () => {
    upsertMirror({
      address,
      alias: stats?.label ?? undefined,
      allocatedUsd: allocated,
      maxTradeUsd: maxTrade,
      slippageBps,
      stopLossPct,
      copyExits,
      autoSign: false,
    });
    setSignResult(null);
    setShowSign(true);
  };

  const handleSign = async () => {
    // There's no live swap to mirror right now — wake-engine only builds a
    // real unsigned transaction once its watcher detects one from this
    // wallet. Freighter's signing prompt needs a real XDR to show, so this
    // preview confirms the mirror config instead of faking a signature.
    setSigning(true);
    await new Promise((r) => setTimeout(r, 400));
    setSignResult(
      `Mirror saved. Wake will open this same Freighter prompt the moment a live swap from ${alias} needs mirroring.`,
    );
    setSigning(false);
    setShowSign(false);
  };

  const signRows: SignRow[] = [
    { k: "Source wallet", v: `${truncateAddress(address)} (${alias})` },
    { k: "Your account", v: wallet ? truncateAddress(wallet.address) : "—" },
    { k: "Max size per trade", v: `${maxTrade.toLocaleString()} XLM` },
    { k: "Slippage cap", v: `${(slippageBps / 100).toFixed(1)}%`, color: "#04808C" },
    { k: "Stop the mirror at", v: `−${stopLossPct}% drawdown` },
    { k: "Network fee", v: "0.00001 XLM", color: "#6E6C62" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-wake-surface">
      <div className="flex flex-none flex-wrap items-center gap-[18px] border-b border-wake-line px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="h-[19px] w-[19px] rounded-full bg-wake-yellow" />
          <span className="font-display text-[20px]">Wake</span>
        </div>
        <span className="font-mono text-[11.5px] tracking-[.08em] text-wake-ink-mute sm:ml-4">
          NEW MIRROR / {alias.toUpperCase()}
        </span>
        <div className="ml-auto flex items-center gap-6 font-mono text-[11.5px]">
          <span className="text-wake-yellow">01 LIMITS</span>
          <span className="text-wake-ink-faint">02 REVIEW</span>
          <span className="text-wake-ink-faint">03 SIGN</span>
          <Link href="/portfolio" className="ml-2 text-wake-ink-mute">
            Save &amp; exit
          </Link>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_560px]">
        <div className="min-w-0 overflow-hidden px-6 py-10 sm:px-14 sm:py-12">
          <h1 className="max-w-[22ch] text-balance font-display text-[32px] font-medium tracking-[-.025em] sm:text-[46px]">
            Set the limits. Wake never exceeds them.
          </h1>
          <p className="mb-10 mt-3 max-w-[52ch] text-[16px] leading-relaxed text-wake-ink-soft">
            Mirrors are capped, not proportional-by-default. If a trade would breach any limit below, it
            is skipped and logged — never partially filled behind your back.
          </p>

          <div className="flex max-w-[640px] flex-col gap-9">
            <SliderField
              label="Capital allocated"
              value={`${allocated.toLocaleString()} XLM`}
              pct={allocPct}
              color="#FDDA24"
              max={balance ?? 0}
              current={allocated}
              onChange={(v) => {
                setAllocated(v);
                if (maxTrade > v * 0.5) setMaxTrade(Math.round(v * 0.2));
              }}
              footer={
                <div className="flex justify-between font-mono text-[11px] text-wake-ink-mute">
                  <span>0 XLM</span>
                  <span>free balance {balance === null ? "…" : `${balance.toLocaleString()} XLM`}</span>
                </div>
              }
            />

            <SliderField
              label="Max size per trade"
              value={`${maxTrade.toLocaleString()} XLM`}
              pct={maxTradePct}
              color="#B7ACE8"
              max={allocated}
              current={maxTrade}
              onChange={setMaxTrade}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <span className="text-[15px] font-medium">Slippage tolerance</span>
                <div className="flex gap-2">
                  {SLIPPAGE_OPTIONS.map((bps) => (
                    <button
                      key={bps}
                      onClick={() => setSlippageBps(bps)}
                      className={`flex-1 rounded-[11px] py-3 text-center font-mono text-[13px] transition-colors ${
                        slippageBps === bps ? "bg-wake-yellow font-medium text-wake-ink" : "border border-wake-line-strong text-wake-ink-soft"
                      }`}
                    >
                      {(bps / 100).toFixed(1)}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[15px] font-medium">Stop the mirror at</span>
                <div className="flex items-center gap-3.5 rounded-[11px] border border-wake-line-strong px-4 py-3">
                  <span className="font-mono text-[13px]">−</span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(Number(e.target.value))}
                    className="w-12 bg-transparent font-mono text-[13px] outline-none"
                  />
                  <span className="font-mono text-[13px]">% drawdown</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 pt-2">
              <ToggleRow
                title="Copy exits as well as entries"
                subtitle="Mirror the close, not just the open"
                checked={copyExits}
                onChange={setCopyExits}
              />
              <ToggleRow
                title="Auto-sign inside limits"
                subtitle="Requires a session key · not available yet"
                checked={false}
                onChange={() => {}}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col border-t border-wake-line bg-wake-panel px-6 py-10 sm:px-11 sm:py-12 lg:border-l lg:border-t-0">
          <span className="mb-5 font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">
            Preview · applied to a recent-size sample
          </span>
          <div className="flex flex-col">
            {preview.map((p) => {
              const yours = Math.min(p.theirsXlm, maxTrade);
              const skipped = yours < 5;
              return (
                <div key={p.pair} className="grid grid-cols-[minmax(0,1fr)_92px_92px] items-center gap-3.5 border-b border-wake-line py-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-mono text-[13px]">{p.pair}</span>
                    <span className="text-[11.5px] text-wake-ink-mute">
                      {skipped ? "Skipped · below floor" : yours < p.theirsXlm ? "Mirrored at your cap" : "Mirrored in full"}
                    </span>
                  </div>
                  <span className="text-right font-mono text-[12.5px] text-wake-ink-mute">{p.theirsXlm.toLocaleString()} XLM</span>
                  <span className="text-right font-mono text-[12.5px]" style={{ color: skipped ? "#6E6C62" : "#14151A" }}>
                    {skipped ? "—" : `${yours.toLocaleString()} XLM`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-px bg-wake-line">
            <div className="flex flex-col gap-1.5 bg-wake-panel px-5 py-[18px]">
              <span className="font-mono text-[10px] uppercase tracking-[.1em] text-wake-ink-mute">Est. 30d return</span>
              <span className="font-display text-[28px] tracking-[-.02em] text-wake-teal">
                +{Math.round(estReturn).toLocaleString()} XLM
              </span>
            </div>
            <div className="flex flex-col gap-1.5 bg-wake-panel px-5 py-[18px]">
              <span className="font-mono text-[10px] uppercase tracking-[.1em] text-wake-ink-mute">Worst sample day</span>
              <span className="font-display text-[28px] tracking-[-.02em] text-wake-red">
                −{Math.round(worstDay).toLocaleString()} XLM
              </span>
            </div>
          </div>
          <p className="mt-5 font-mono text-[11px] leading-relaxed text-wake-ink-mute">
            Illustrative sizing against a sample of this wallet&apos;s recent trade sizes at your limits.
            Past performance is not a forecast.
          </p>

          {signResult && (
            <div className="mt-5 rounded-xl border border-wake-line-strong px-4 py-3 text-[13px] text-wake-ink-soft">
              {signResult}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <button
              onClick={handleReviewAndSign}
              className="h-14 rounded-2xl bg-wake-yellow text-[16px] font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[.99]"
            >
              Review &amp; sign
            </button>
            <Link
              href="/portfolio"
              onClick={() =>
                upsertMirror({
                  address,
                  alias: stats?.label ?? undefined,
                  allocatedUsd: allocated,
                  maxTradeUsd: maxTrade,
                  slippageBps,
                  stopLossPct,
                  copyExits,
                  autoSign: false,
                })
              }
              className="flex h-14 items-center justify-center rounded-2xl border border-wake-line-strong text-[16px] transition-colors hover:bg-black/[.06]"
            >
              Save for paper-trading first
            </Link>
          </div>
        </div>
      </div>

      {showSign && (
        <SignModal
          title={`Preview: mirror ${alias}`}
          rows={signRows}
          note={`Inside every limit on your ${alias} mirror. Slippage capped at ${(slippageBps / 100).toFixed(
            1,
          )}% — the transaction fails rather than fills worse.`}
          signing={signing}
          onSkip={() => setShowSign(false)}
          onSign={handleSign}
        />
      )}
    </div>
  );
}

function SliderField({
  label,
  value,
  pct,
  color,
  max,
  current,
  onChange,
  footer,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  max: number;
  current: number;
  onChange: (v: number) => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium">{label}</span>
        <span className="font-display text-[26px] tracking-[-.02em] sm:text-[30px]">{value}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-black/[.09]">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: color }} />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
          style={{ left: `${pct}%`, transform: "translate(-50%,-50%)", background: color }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(max, 1)}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      {footer}
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-4 border-t border-wake-line py-[18px] text-left disabled:opacity-60"
    >
      <div
        className="box-border flex h-[23px] w-10 flex-none items-center rounded-full p-[3px] transition-colors"
        style={{ background: checked ? "#04808C" : "rgba(20,21,26,.14)", justifyContent: checked ? "flex-end" : "flex-start" }}
      >
        <div className="h-[17px] w-[17px] rounded-full" style={{ background: checked ? "#FBFAF7" : "#6E6C62" }} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[14.5px]">{title}</span>
        <span className="text-[12.5px] text-wake-ink-mute">{subtitle}</span>
      </div>
    </button>
  );
}
