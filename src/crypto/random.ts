/**
 * Pluggable secure-random source for the engine.
 *
 * Defaults to @noble's `randomBytes` (backed by WebCrypto), which works in Node
 * — so the issuer script and tests need no setup. In Hermes, `globalThis.crypto`
 * is unreliable, so the app calls `setRandomBytes` at startup to route through
 * expo-crypto instead. The default is only ever *called* when random is needed,
 * so importing this in RN never throws.
 */
import { randomBytes as nobleRandomBytes } from '@noble/hashes/utils';

let impl: (length: number) => Uint8Array = nobleRandomBytes;

export function setRandomBytes(fn: (length: number) => Uint8Array): void {
  impl = fn;
}

export function randomBytes(length: number): Uint8Array {
  return impl(length);
}
