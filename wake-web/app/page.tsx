"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectFreighter, isFreighterInstalled } from "@/lib/freighter";
import { useWakeWebStore } from "@/lib/store";

export default function ConnectPage() {
  const router = useRouter();
  const connect = useWakeWebStore((s) => s.connect);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFreighter = async () => {
    setError(null);
    setConnecting(true);
    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        setError("Freighter isn't installed. Get it at freighter.app, then try again.");
        return;
      }
      const { address } = await connectFreighter();
      connect(address, "freighter");
      router.push("/discover");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't connect to Freighter.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-wake-surface">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 90% at 82% 8%, rgba(253,218,36,.34), transparent 62%), radial-gradient(60% 80% at 4% 74%, rgba(0,46,93,.10), transparent 70%)",
        }}
      />
      <div className="wake-dot-grid pointer-events-none absolute inset-0 opacity-55" />

      <header className="relative flex items-center justify-between border-b border-wake-line px-6 py-5 sm:px-11">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-wake-yellow" />
          <span className="font-display text-xl tracking-[-.01em]">Wake</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-wake-ink-soft sm:flex">
          <span>How it works</span>
          <span>Traders</span>
          <a href="https://github.com/Hussman256/wake" target="_blank" rel="noreferrer">
            Docs
          </a>
          <button
            type="button"
            onClick={handleFreighter}
            disabled={connecting}
            className="h-[42px] rounded-[11px] border border-wake-line-strong px-5 text-sm font-medium transition-colors hover:bg-black/[.07] disabled:opacity-60"
          >
            {connecting ? "Connecting…" : "Connect wallet"}
          </button>
        </div>
      </header>

      <div className="relative grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_520px]">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-11 lg:py-0">
          <span className="mb-6 font-mono text-[11.5px] uppercase tracking-[.16em] text-wake-yellow">
            Copy trading on Stellar · Soroban
          </span>
          <h1 className="max-w-[14ch] text-balance font-display text-[52px] font-medium leading-[1] tracking-[-.03em] sm:text-[72px] lg:text-[86px]">
            Follow a proven trader. Keep your keys.
          </h1>
          <p className="mt-7 max-w-[46ch] text-balance text-lg leading-relaxed text-wake-ink-soft">
            Every trade on Stellar is public. Wake reads that record, ranks the wallets that actually
            perform, and mirrors the ones you pick — sized to limits you set, signed by you.
          </p>
          <div className="mt-14 grid max-w-[720px] grid-cols-1 gap-px bg-wake-line sm:grid-cols-3">
            <StatTile value="1,204" label="Wallets scored" />
            <StatTile value="4.2s" label="Median mirror lag" color="#04808C" />
            <StatTile value="0" label="Funds held by Wake" />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3.5 border-t border-wake-line bg-wake-surface/80 px-6 py-14 backdrop-blur-sm sm:px-13 lg:border-l lg:border-t-0">
          <span className="mb-3 font-mono text-[10.5px] uppercase tracking-[.14em] text-wake-ink-mute">
            Choose a wallet
          </span>

          <button
            type="button"
            onClick={handleFreighter}
            disabled={connecting}
            className="flex items-center gap-4 rounded-2xl bg-wake-yellow px-[22px] py-5 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[.99] disabled:opacity-70"
          >
            <div className="h-[34px] w-[34px] rounded-[10px] bg-black/[.12]" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-semibold">Freighter</span>
              <span className="text-[12.5px] opacity-70">Browser extension · {connecting ? "connecting…" : "click to connect"}</span>
            </div>
            <span className="ml-auto text-[16px]">→</span>
          </button>

          <WalletOption name="Albedo" subtitle="Web signer" color="#B7ACE8" />
          <WalletOption name="Ledger" subtitle="Hardware · USB" color="#04808C" />

          {error && <p className="mt-2 text-[13px] leading-snug text-wake-red">{error}</p>}

          <div className="mt-7 flex flex-col gap-3.5 border-t border-wake-line pt-6">
            <Bullet color="#04808C">Wake reads your public account and prepares transactions. It cannot move funds.</Bullet>
            <Bullet color="#B7ACE8">Every mirrored trade is signed in your wallet, or it does not happen.</Bullet>
            <p className="mt-2.5 font-mono text-[11.5px] leading-relaxed text-wake-ink-mute">
              Non-custodial by construction. Not by policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="flex flex-col gap-2 bg-wake-surface px-[26px] py-6">
      <span className="font-display text-[34px] tracking-[-.02em]" style={{ color: color ?? "#14151A" }}>
        {value}
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-wake-ink-mute">{label}</span>
    </div>
  );
}

function WalletOption({ name, subtitle, color }: { name: string; subtitle: string; color: string }) {
  return (
    <button
      type="button"
      onClick={() => alert(`${name} support is coming soon — connect with Freighter for now.`)}
      className="flex items-center gap-4 rounded-2xl border border-wake-line-strong px-[22px] py-5 text-left transition-all hover:-translate-y-0.5 hover:bg-black/[.06]"
    >
      <div className="h-[34px] w-[34px] rounded-[10px]" style={{ background: color }} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[16px] font-semibold">{name}</span>
        <span className="text-[12.5px] text-wake-ink-mute">{subtitle}</span>
      </div>
    </button>
  );
}

function Bullet({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-[7px] h-[7px] w-[7px] flex-none rounded-full" style={{ background: color }} />
      <span className="text-sm leading-relaxed text-wake-ink-soft">{children}</span>
    </div>
  );
}
