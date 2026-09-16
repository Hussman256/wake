import type { DexAdapter } from "../adapters/DexAdapter.js";

/**
 * Picks the adapter to mirror a swap on. v1 ships one adapter (Aquarius),
 * so this just matches by name — the seam exists so Soroswap/Phoenix
 * adapters (v0.2+) plug in without touching the executor.
 */
export function pickAdapter(adapters: DexAdapter[], dex: string): DexAdapter {
  const adapter = adapters.find((a) => a.name === dex);
  if (!adapter) {
    throw new Error(`No adapter registered for DEX "${dex}"`);
  }
  return adapter;
}
