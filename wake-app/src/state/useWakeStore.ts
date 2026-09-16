import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FollowedWallet {
  address: string;
  label?: string;
  maxPositionPct: number;
  maxSlippageBps: number;
  stopLossPct: number;
}

interface WakeState {
  hasOnboarded: boolean;
  wallet: { publicKey: string } | null;
  followedWallets: FollowedWallet[];
  notificationsEnabled: boolean;
  completeOnboarding: () => void;
  connectWallet: (publicKey: string) => void;
  disconnectWallet: () => void;
  followWallet: (config: FollowedWallet) => void;
  unfollowWallet: (address: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useWakeStore = create<WakeState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      wallet: null,
      followedWallets: [],
      notificationsEnabled: true,

      completeOnboarding: () => set({ hasOnboarded: true }),

      connectWallet: (publicKey) => set({ wallet: { publicKey } }),

      disconnectWallet: () => set({ wallet: null }),

      followWallet: (config) =>
        set((state) => ({
          followedWallets: [...state.followedWallets.filter((w) => w.address !== config.address), config],
        })),

      unfollowWallet: (address) =>
        set((state) => ({
          followedWallets: state.followedWallets.filter((w) => w.address !== address),
        })),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: "wake-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
