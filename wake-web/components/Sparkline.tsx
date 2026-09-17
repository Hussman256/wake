export function Sparkline({ points, color = "#04808C" }: { points: string; color?: string }) {
  return (
    <svg viewBox="0 0 104 26" preserveAspectRatio="none" className="block h-[26px] w-[104px] overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
