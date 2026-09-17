"use client";

import {
  getAddress,
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";

export interface ConnectResult {
  address: string;
}

/**
 * Freighter never hands Wake a secret key — only a public address and,
 * later, a signed transaction envelope. Wake reads and prepares
 * transactions; it cannot move funds.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const { isConnected: connected } = await isConnected();
    return !!connected;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<ConnectResult> {
  const access = await requestAccess();
  if (access.error) throw new Error(access.error);
  return { address: access.address };
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const res = await getAddress();
    return res.error ? null : res.address;
  } catch {
    return null;
  }
}

export async function signWithFreighter(xdr: string, networkPassphrase: string, address: string): Promise<string> {
  const res = await freighterSignTransaction(xdr, { networkPassphrase, address });
  if (res.error) throw new Error(String(res.error));
  return res.signedTxXdr;
}
