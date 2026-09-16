import * as Linking from "expo-linking";

/**
 * Freighter's mobile deep-link connect flow: we send the dApp's return URL
 * and Freighter redirects back to it with the selected public key. Wake
 * never receives or requests a secret key — only the public address.
 *
 * Freighter's exact deep-link contract can change between app releases; if
 * this stops round-tripping, check https://docs.freighter.app for the
 * current scheme before touching the sizing/execution code that depends on
 * it.
 */
const FREIGHTER_CONNECT_URL = "https://freighter.app/connect";

export function buildConnectUrl(): string {
  const returnUrl = Linking.createURL("connect-wallet/callback");
  const params = new URLSearchParams({ returnUrl, network: "TESTNET" });
  return `${FREIGHTER_CONNECT_URL}?${params.toString()}`;
}

export function parsePublicKeyFromCallback(url: string): string | null {
  const { queryParams } = Linking.parse(url);
  const publicKey = queryParams?.publicKey;
  return typeof publicKey === "string" ? publicKey : null;
}
