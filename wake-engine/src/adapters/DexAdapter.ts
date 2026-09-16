import type { Transaction } from "@stellar/stellar-sdk";
import type { Asset, OperationRecord, Quote, SwapEvent, SwapParams } from "../types.js";

/**
 * One file per DEX implements this. Keeps the watcher/router/executor
 * ignorant of any particular DEX's contract/pool details.
 */
export interface DexAdapter {
  name: string;
  getQuote(params: { sellAsset: Asset; buyAsset: Asset; amount: bigint }): Promise<Quote>;
  /** Builds an unsigned swap transaction (XDR ready to sign). */
  buildSwapTx(params: SwapParams): Promise<Transaction>;
  /** Feeds the watcher: returns a SwapEvent if this operation is a swap on this DEX, else null. */
  parseSwapFromLedgerEntry(op: OperationRecord): SwapEvent | null;
}
