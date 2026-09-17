"use client";

import { useEffect } from "react";
import { useWakeWebStore } from "@/lib/store";

/** Persisted store uses `skipHydration` so SSR/prerendering never touches
 * `localStorage`; this kicks off the real client-side hydration once. */
export function StoreHydration() {
  useEffect(() => {
    void useWakeWebStore.persist.rehydrate();
  }, []);
  return null;
}
