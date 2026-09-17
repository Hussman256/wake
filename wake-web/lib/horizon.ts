import "./polyfills";
import { Horizon } from "@stellar/stellar-sdk";
import { TESTNET_CONFIG } from "wake-engine";

const server = new Horizon.Server(TESTNET_CONFIG.horizonUrl);

export async function fetchXlmBalance(address: string): Promise<number | null> {
  try {
    const account = await server.loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? Number(native.balance) : 0;
  } catch {
    return null;
  }
}
