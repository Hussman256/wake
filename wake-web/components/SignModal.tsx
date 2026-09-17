"use client";

export interface SignRow {
  k: string;
  v: string;
  color?: string;
}

export function SignModal({
  title,
  rows,
  note,
  signing,
  onSkip,
  onSign,
}: {
  title: string;
  rows: SignRow[];
  note: string;
  signing: boolean;
  onSkip: () => void;
  onSign: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-wake-bg/72 p-6">
      <div className="w-full max-w-[620px] overflow-hidden rounded-3xl border border-wake-line-strong bg-wake-panel shadow-[0_40px_90px_-34px_rgba(20,21,26,.34)]">
        <div className="flex items-center gap-3.5 border-b border-wake-line px-[34px] py-[26px]">
          <div className="h-[30px] w-[30px] flex-none rounded-[9px] bg-wake-yellow" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">Confirm in Freighter</span>
            <span className="font-mono text-[11.5px] text-wake-ink-mute">Wake prepared this transaction · it cannot sign it</span>
          </div>
          <button onClick={onSkip} className="ml-auto text-lg text-wake-ink-mute" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-[34px] py-8">
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-wake-ink-mute">Mirrored trade</span>
          <h3 className="my-3.5 font-display text-[30px] font-medium tracking-[-.025em] sm:text-[38px]">{title}</h3>
          <div className="flex flex-col">
            {rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-5 border-t border-wake-line py-3.5">
                <span className="text-sm text-wake-ink-mute">{r.k}</span>
                <span className="text-right font-mono text-[13px]" style={{ color: r.color ?? "#14151A" }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-wake-teal/30 bg-wake-teal/[.08] px-[18px] py-4">
            <div className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-wake-teal" />
            <span className="text-[13.5px] leading-relaxed text-wake-teal-dark">{note}</span>
          </div>
        </div>

        <div className="flex gap-3 px-[34px] pb-8">
          <button
            onClick={onSkip}
            className="h-[54px] w-[150px] flex-none rounded-2xl border border-wake-line-strong text-[15.5px] transition-colors hover:bg-black/[.06]"
          >
            Skip trade
          </button>
          <button
            onClick={onSign}
            disabled={signing}
            className="h-[54px] flex-1 rounded-2xl bg-wake-yellow text-[15.5px] font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[.99] disabled:opacity-70"
          >
            {signing ? "Opening Freighter…" : "Open Freighter to sign"}
          </button>
        </div>
      </div>
    </div>
  );
}
