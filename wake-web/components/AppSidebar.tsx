"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWakeWebStore } from "@/lib/store";
import { truncateAddress } from "@/lib/demo-data";

const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const wallet = useWakeWebStore((s) => s.wallet);
  const mirrorCount = useWakeWebStore((s) => s.mirrors.length);

  return (
    <aside className="flex w-[232px] flex-none flex-col border-r border-wake-line py-6">
      <div className="flex items-center gap-[11px] px-6 pb-[30px]">
        <div className="h-[19px] w-[19px] flex-none rounded-full bg-wake-yellow" />
        <span className="font-display text-[20px] tracking-[-.01em]">Wake</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-[14.5px] transition-colors ${
                active ? "bg-wake-yellow font-semibold text-wake-ink" : "text-wake-ink-mute hover:bg-black/5"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: active ? "#14151A" : "#C3BFB2" }}
              />
              {item.label}
              {item.label === "Portfolio" && mirrorCount > 0 && (
                <span className="ml-auto font-mono text-[11px] text-wake-ink-soft">{mirrorCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-6">
        <div className="flex items-center gap-2.5">
          <div className="relative h-[7px] w-[7px] flex-none">
            <div className="absolute inset-0 rounded-full bg-wake-teal" />
            <div className="wake-pulse-ring absolute inset-0 rounded-full bg-wake-teal" />
          </div>
          <span className="font-mono text-[11px] text-wake-ink-soft">
            {mirrorCount > 0 ? `${mirrorCount} mirror${mirrorCount === 1 ? "" : "s"} live` : "Horizon synced"}
          </span>
        </div>
        <span className="font-mono text-[11px] text-wake-ink-mute">
          {wallet ? truncateAddress(wallet.address) : "Not connected"}
        </span>
      </div>
    </aside>
  );
}
