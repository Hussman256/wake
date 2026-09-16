import { Buffer } from "buffer";

// @stellar/stellar-sdk expects a global Buffer, which React Native's JS
// engine doesn't provide. Must be imported before anything that touches
// wake-engine/stellar-sdk (see app/_layout.tsx).
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}
