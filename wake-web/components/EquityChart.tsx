export function EquityChart({ curve, curveArea, drawdown }: { curve: string; curveArea: string; drawdown: string }) {
  return (
    <div className="relative mb-[26px] h-[232px]">
      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="h-px bg-wake-line-soft" />
        <div className="h-px bg-wake-line-soft" />
        <div className="h-px bg-wake-line-soft" />
        <div className="h-px bg-wake-line-soft" />
      </div>
      <svg viewBox="0 0 1000 232" preserveAspectRatio="none" className="relative block h-[232px] w-full">
        <polygon points={curveArea} fill="rgba(4,128,140,.12)" />
        <polyline
          points={curve}
          fill="none"
          stroke="#04808C"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1600"
          style={{ animation: "wake-draw 1.6s cubic-bezier(.22,1,.36,1) forwards" }}
        />
        <polyline points={drawdown} fill="none" stroke="#B7ACE8" strokeWidth="1.4" strokeDasharray="4 5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
