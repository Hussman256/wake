import { Horizon } from "@stellar/stellar-sdk";
import type { DexAdapter } from "../adapters/DexAdapter.js";
import type { OperationRecord, SwapEvent } from "../types.js";

export interface WalletWatcherConfig {
  horizonUrl: string;
  pollIntervalMs: number;
}

/**
 * Polls Horizon for a wallet's operations and emits a SwapEvent for each
 * one any of the given adapters recognizes. Streaming (Horizon SSE) is a
 * straightforward swap-in later; polling keeps v1 simple and testable.
 */
export class WalletWatcher {
  private readonly horizon: Horizon.Server;
  private readonly pollIntervalMs: number;

  constructor(config: WalletWatcherConfig, private readonly adapters: DexAdapter[]) {
    this.horizon = new Horizon.Server(config.horizonUrl);
    this.pollIntervalMs = config.pollIntervalMs;
  }

  watch(walletAddress: string, onSwap: (event: SwapEvent) => void): () => void {
    let cursor = "now";
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const page = await this.horizon
          .operations()
          .forAccount(walletAddress)
          .cursor(cursor)
          .order("asc")
          .limit(50)
          .call();

        for (const record of page.records) {
          cursor = record.paging_token;
          const event = this.parse(record as unknown as OperationRecord);
          if (event) onSwap(event);
        }
      } catch {
        // A transient Horizon error should not kill the watcher; it retries next tick.
      } finally {
        if (!stopped) setTimeout(poll, this.pollIntervalMs);
      }
    };

    void poll();

    return () => {
      stopped = true;
    };
  }

  private parse(op: OperationRecord): SwapEvent | null {
    for (const adapter of this.adapters) {
      const event = adapter.parseSwapFromLedgerEntry(op);
      if (event) return event;
    }
    return null;
  }
}
