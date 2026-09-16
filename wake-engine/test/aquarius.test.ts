import { describe, expect, it } from "vitest";
import { AquariusAdapter, TESTNET_CONFIG } from "../src/adapters/aquarius.js";
import type { OperationRecord } from "../src/types.js";

describe("AquariusAdapter.parseSwapFromLedgerEntry", () => {
  const adapter = new AquariusAdapter(TESTNET_CONFIG);

  it("parses a path_payment_strict_send into a SwapEvent", () => {
    const op: OperationRecord = {
      type: "path_payment_strict_send",
      transaction_hash: "deadbeef",
      source_account: "GFOLLOWED",
      created_at: "2026-01-01T00:00:00Z",
      source_asset_type: "native",
      source_amount: "100.0000000",
      asset_type: "credit_alphanum4",
      asset_code: "AQUA",
      asset_issuer: "GISSUER",
      amount: "42.0000000",
    };

    const event = adapter.parseSwapFromLedgerEntry(op);

    expect(event).not.toBeNull();
    expect(event?.dex).toBe("aquarius");
    expect(event?.wallet).toBe("GFOLLOWED");
    expect(event?.sellAsset).toEqual({ code: "XLM" });
    expect(event?.buyAsset).toEqual({ code: "AQUA", issuer: "GISSUER" });
    expect(event?.sellAmount).toBe(1_000_000_000n);
    expect(event?.buyAmount).toBe(420_000_000n);
  });

  it("returns null for unrelated operation types", () => {
    const op: OperationRecord = {
      type: "create_account",
      transaction_hash: "abc",
      source_account: "GX",
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(adapter.parseSwapFromLedgerEntry(op)).toBeNull();
  });

  it("returns null when asset fields are missing", () => {
    const op: OperationRecord = {
      type: "path_payment_strict_send",
      transaction_hash: "abc",
      source_account: "GX",
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(adapter.parseSwapFromLedgerEntry(op)).toBeNull();
  });
});
