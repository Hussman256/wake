import { Asset as StellarAsset, Horizon, TransactionBuilder, BASE_FEE, Networks, Operation } from "@stellar/stellar-sdk";
import type { Transaction } from "@stellar/stellar-sdk";
import type { DexAdapter } from "./DexAdapter.js";
import type { Asset, OperationRecord, Quote, SwapEvent, SwapParams } from "../types.js";

export interface AquariusAdapterConfig {
  horizonUrl: string;
  networkPassphrase: string;
}

function toStellarAsset(asset: Asset): StellarAsset {
  return asset.issuer ? new StellarAsset(asset.code, asset.issuer) : StellarAsset.native();
}

function assetKey(a: { asset_type: string; asset_code?: string; asset_issuer?: string }): string {
  return a.asset_type === "native" ? "native" : `${a.asset_code}:${a.asset_issuer}`;
}

/**
 * Aquarius runs its AMM pairs on Stellar's classic constant-product
 * liquidity pools, so quoting and swap-building both go through Horizon's
 * `/liquidity_pools` and path-payment machinery rather than a bespoke
 * Soroban contract call.
 */
export class AquariusAdapter implements DexAdapter {
  readonly name = "aquarius";
  private readonly horizon: Horizon.Server;
  private readonly networkPassphrase: string;

  constructor(config: AquariusAdapterConfig) {
    this.horizon = new Horizon.Server(config.horizonUrl);
    this.networkPassphrase = config.networkPassphrase;
  }

  private async findPool(sellAsset: Asset, buyAsset: Asset) {
    const sell = toStellarAsset(sellAsset);
    const buy = toStellarAsset(buyAsset);
    const page = await this.horizon
      .liquidityPools()
      .forAssets(sell, buy)
      .limit(1)
      .call();
    const pool = page.records[0];
    if (!pool) {
      throw new Error(`No Aquarius pool found for ${sellAsset.code}/${buyAsset.code}`);
    }
    return pool;
  }

  async getQuote(params: { sellAsset: Asset; buyAsset: Asset; amount: bigint }): Promise<Quote> {
    const pool = await this.findPool(params.sellAsset, params.buyAsset);
    const sellKey = assetKey(
      params.sellAsset.issuer
        ? { asset_type: "credit", asset_code: params.sellAsset.code, asset_issuer: params.sellAsset.issuer }
        : { asset_type: "native" },
    );
    const reserveSell = pool.reserves.find((r) => {
      const [type, code, issuer] = r.asset === "native" ? ["native"] : r.asset.split(":");
      return assetKey({ asset_type: type === "native" ? "native" : "credit", asset_code: code, asset_issuer: issuer }) === sellKey;
    });
    const reserveBuy = pool.reserves.find((r) => r !== reserveSell);
    if (!reserveSell || !reserveBuy) {
      throw new Error("Pool reserves did not match the requested asset pair");
    }

    const feeBps = BigInt(pool.fee_bp);
    const reserveIn = BigInt(Math.round(Number(reserveSell.amount) * 1e7));
    const reserveOut = BigInt(Math.round(Number(reserveBuy.amount) * 1e7));
    const amountInAfterFee = (params.amount * (10_000n - feeBps)) / 10_000n;
    // constant product: out = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee)
    const buyAmount = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);
    const spotOut = (reserveOut * amountInAfterFee) / reserveIn;
    const priceImpactBps = spotOut === 0n ? 0 : Number(((spotOut - buyAmount) * 10_000n) / spotOut);

    return {
      dex: this.name,
      sellAsset: params.sellAsset,
      buyAsset: params.buyAsset,
      sellAmount: params.amount,
      buyAmount,
      priceImpactBps,
      poolId: pool.id,
    };
  }

  async buildSwapTx(params: SwapParams): Promise<Transaction> {
    const account = await this.horizon.loadAccount(params.sourceAccount);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAsset: toStellarAsset(params.sellAsset),
          sendAmount: (Number(params.sellAmount) / 1e7).toFixed(7),
          destination: params.sourceAccount,
          destAsset: toStellarAsset(params.buyAsset),
          destMin: (Number(params.minBuyAmount) / 1e7).toFixed(7),
          path: [],
        }),
      )
      .setTimeout(30)
      .build();
    return tx;
  }

  parseSwapFromLedgerEntry(op: OperationRecord): SwapEvent | null {
    if (op.type !== "path_payment_strict_send" && op.type !== "path_payment_strict_receive") {
      return null;
    }
    const sourceAssetType = op.source_asset_type as string | undefined;
    const assetType = op.asset_type as string | undefined;
    if (!sourceAssetType || !assetType) return null;

    const sellAsset: Asset =
      sourceAssetType === "native"
        ? { code: "XLM" }
        : { code: op.source_asset_code as string, issuer: op.source_asset_issuer as string };
    const buyAsset: Asset =
      assetType === "native" ? { code: "XLM" } : { code: op.asset_code as string, issuer: op.asset_issuer as string };

    const sellAmount = op.source_amount ? BigInt(Math.round(Number(op.source_amount) * 1e7)) : 0n;
    const buyAmount = op.amount ? BigInt(Math.round(Number(op.amount) * 1e7)) : 0n;

    return {
      dex: this.name,
      wallet: op.source_account,
      txHash: op.transaction_hash,
      ledgerSeq: Number(op.ledger ?? 0),
      sellAsset,
      buyAsset,
      sellAmount,
      buyAmount,
      timestamp: new Date(op.created_at),
    };
  }
}

export const TESTNET_CONFIG: AquariusAdapterConfig = {
  horizonUrl: "https://horizon-testnet.stellar.org",
  networkPassphrase: Networks.TESTNET,
};
