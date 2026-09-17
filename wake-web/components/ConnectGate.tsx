"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWakeWebStore } from "@/lib/store";

export function ConnectGate({ children }: { children: React.ReactNode }) {
  const wallet = useWakeWebStore((s) => s.wallet);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() => useWakeWebStore.persist.hasHydrated());

  useEffect(() => {
    // In React StrictMode's dev double-invoke, hydration can finish during
    // the first (discarded) mount pass, so the "finish" event fires before
    // this listener is attached on the second pass. Sync eagerly too.
    const sync = () => setHydrated(useWakeWebStore.persist.hasHydrated());
    sync();
    return useWakeWebStore.persist.onFinishHydration(sync);
  }, []);

  useEffect(() => {
    if (hydrated && !wallet) router.replace("/");
  }, [hydrated, wallet, router]);

  if (!hydrated || !wallet) return null;
  return <>{children}</>;
}
