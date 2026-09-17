import { Buffer } from "buffer";

// @stellar/stellar-sdk expects a global Buffer, which the browser doesn't
// provide. Must be imported before anything that touches wake-engine or
// stellar-sdk directly (see lib/wake-engine-client.ts).
if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}
