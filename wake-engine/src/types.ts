import type { Transaction } from "@stellar/stellar-sdk";

export interface Asset {
  code: string;
  issuer?: string;
}

export interface Quote {
  dex: string;
  sellAsset: Asset;
  buyAsset: Asset;
  sellAmount: bigint;
  buyAmount: bigint;
  priceImpactBps: number;
  poolId: string;
}

export interface SwapParams {
  sourceAccount: string;
  sellAsset: Asset;
  buyAsset: Asset;
  sellAmount: bigint;
  minBuyAmount: bigint;
  poolId: string;
}

export interface SwapEvent {
  dex: string;
  wallet: string;
  txHash: string;
  ledgerSeq: number;
  sellAsset: Asset;
  buyAsset: Asset;
  sellAmount: bigint;
  buyAmount: bigint;
  timestamp: Date;
}

export type FollowMode = "proportional" | "fixed";

export interface FollowConfig {
  mode: FollowMode;
  /** Fraction of the follower's sellAsset balance to mirror with, 0-1. Used when mode is "proportional". */
  maxPositionPct: number;
  maxSlippageBps: number;
  minPoolLiquidity: bigint;
  /** Absolute sell amount to use when mode is "fixed", in the sell asset's smallest unit. */
  fixedAmount?: bigint;
}

export interface FollowerContext {
  account: string;
  sellAssetBalance: bigint;
}

export interface MirrorResult {
  submitted: boolean;
  dryRun: boolean;
  reason?: string;
  swap?: SwapEvent;
  quote?: Quote;
  mirrorSellAmount?: bigint;
  unsignedTx?: Transaction;
  txHash?: string;
}

export interface TransactionSigner {
  sign(tx: Transaction): Promise<Transaction>;
}

/** Minimal shape of a Horizon operation record needed to detect swaps; avoids depending on the full SDK response type. */
export interface OperationRecord {
  type: string;
  transaction_hash: string;
  source_account: string;
  created_at: string;
  [key: string]: unknown;
}
