"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface MirrorConfig {
  address: string;
  alias?: string;
  allocatedUsd: number;
  maxTradeUsd: number;
  slippageBps: number;
  stopLossPct: number;
  copyExits: boolean;
  autoSign: boolean;
}

interface WakeWebState {
  wallet: { address: string; walletKit: string } | null;
  mirrors: MirrorConfig[];
  connect: (address: string, walletKit: string) => void;
  disconnect: () => void;
  upsertMirror: (config: MirrorConfig) => void;
  removeMirror: (address: string) => void;
}

export const useWakeWebStore = create<WakeWebState>()(
  persist(
    (set) => ({
      wallet: null,
      mirrors: [],

      connect: (address, walletKit) => set({ wallet: { address, walletKit } }),

      disconnect: () => set({ wallet: null }),

      upsertMirror: (config) =>
        set((state) => ({
          mirrors: [...state.mirrors.filter((m) => m.address !== config.address), config],
        })),

      removeMirror: (address) =>
        set((state) => ({
          mirrors: state.mirrors.filter((m) => m.address !== address),
        })),
    }),
    {
      name: "wake-web-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : noopStorage)),
      skipHydration: true,
    },
  ),
);
