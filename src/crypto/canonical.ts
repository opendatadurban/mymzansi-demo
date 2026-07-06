/**
 * Deterministic JSON canonicalisation and hashing primitives shared by the
 * issuer (Node) and the wallet/verifier (React Native).
 *
 * We keep this runtime-agnostic on purpose: no Buffer, no atob/btoa, no
 * TextDecoder (Hermes ships TextEncoder but not TextDecoder, hence bytesToUtf8
 * below) — only @noble utilities. The same bytes must come out on the phone
 * and on the issuing server, or signatures won't verify.
 */
import { utf8ToBytes, bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/**
 * Stable JSON stringify: object keys are emitted in sorted order at every
 * level, arrays keep their order. This is a pragmatic canonicalisation (not
 * full RFC 8785 / JCS), which is sufficient here because the exact same
 * function produces the signing input on both sides. Documented as an
 * assumption in the write-up.
 */
export function stableStringify(value: Json): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']';
  }
  const keys = Object.keys(value).sort();
  const entries = keys.map(
    (k) => JSON.stringify(k) + ':' + stableStringify((value as Record<string, Json>)[k])
  );
  return '{' + entries.join(',') + '}';
}

/**
 * UTF-8 bytes of the canonical form of a JSON value. Accepts `unknown` so
 * typed interfaces (which TS does not treat as index-signature `Json`) can be
 * passed without casts at every call site; the value must be JSON-serialisable.
 */
export function canonicalBytes(value: unknown): Uint8Array {
  return utf8ToBytes(stableStringify(value as Json));
}

/** Lowercase hex SHA-256 of a JSON value's canonical form. */
export function sha256Hex(value: unknown): string {
  return bytesToHex(sha256(canonicalBytes(value)));
}

/**
 * Decode UTF-8 bytes to a string without relying on TextDecoder, which is not
 * guaranteed in Hermes. Handles the full BMP + supplementary planes, enough
 * for our JSON (including isiZulu/Afrikaans diacritics).
 */
export function bytesToUtf8(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) {
      out += String.fromCharCode(b);
    } else if (b < 0xe0) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    } else if (b < 0xf0) {
      out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
    } else {
      const cp =
        ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
      const c = cp - 0x10000;
      out += String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 0x3ff));
    }
  }
  return out;
}

export { bytesToHex, hexToBytes, utf8ToBytes };
