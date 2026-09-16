import "../polyfills";
import { TransactionBuilder } from "@stellar/stellar-sdk";
import {
  AquariusAdapter,
  MirrorExecutor,
  TESTNET_CONFIG,
  WalletWatcher,
  computeMirrorSize,
  type FollowConfig,
  type FollowerContext,
  type MirrorResult,
  type SwapEvent,
  type TransactionSigner,
} from "wake-engine";

/**
 * Thin app-side wrapper around wake-engine. Wake never signs: the
 * TransactionSigner handed to MirrorExecutor must come from the connected
 * wallet (Freighter's signTransaction), never from key material stored in
 * the app.
 */
export function createFreighterSigner(signWithFreighter: (xdr: string) => Promise<string>): TransactionSigner {
  return {
    async sign(tx) {
      const signedXdr = await signWithFreighter(tx.toXDR());
      return TransactionBuilder.fromXDR(signedXdr, tx.networkPassphrase) as typeof tx;
    },
  };
}

export function watchFollowedWallet(address: string, onSwap: (event: SwapEvent) => void) {
  const adapter = new AquariusAdapter(TESTNET_CONFIG);
  const watcher = new WalletWatcher({ horizonUrl: TESTNET_CONFIG.horizonUrl, pollIntervalMs: 15_000 }, [adapter]);
  return watcher.watch(address, onSwap);
}

export function createMirrorExecutor(signer: TransactionSigner, follow: FollowConfig) {
  const adapter = new AquariusAdapter(TESTNET_CONFIG);
  return new MirrorExecutor([adapter], signer, {
    horizonUrl: TESTNET_CONFIG.horizonUrl,
    dryRun: false,
    follow,
  });
}

export async function previewMirror(
  swap: SwapEvent,
  follower: FollowerContext,
  follow: FollowConfig,
): Promise<{ mirrorSellAmount: bigint }> {
  return { mirrorSellAmount: computeMirrorSize(swap, follower.sellAssetBalance, follow) };
}

export type { FollowConfig, FollowerContext, MirrorResult, SwapEvent };
