/**
 * Ed25519 signing/verification, wired for both Node and React Native.
 *
 * @noble/ed25519 v2 needs a synchronous SHA-512 provided before its sync
 * `sign`/`verify`/`getPublicKey` can run. We supply it from @noble/hashes.
 * Both packages are pure JS, so this works identically in Hermes and Node.
 */
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

// Wire the sync hash exactly once (module-level, idempotent).
if (!ed.etc.sha512Sync) {
  ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));
}

export interface KeyPair {
  privateKeyHex: string;
  publicKeyHex: string;
}

export function generateKeyPair(): KeyPair {
  const priv = ed.utils.randomPrivateKey();
  const pub = ed.getPublicKey(priv);
  return { privateKeyHex: bytesToHex(priv), publicKeyHex: bytesToHex(pub) };
}

export function publicKeyFromPrivate(privateKeyHex: string): string {
  return bytesToHex(ed.getPublicKey(hexToBytes(privateKeyHex)));
}

/** Sign raw bytes, returning a hex signature. */
export function signBytes(message: Uint8Array, privateKeyHex: string): string {
  return bytesToHex(ed.sign(message, hexToBytes(privateKeyHex)));
}

/** Verify a hex signature over raw bytes. Never throws — returns false on any malformed input. */
export function verifyBytes(signatureHex: string, message: Uint8Array, publicKeyHex: string): boolean {
  try {
    return ed.verify(hexToBytes(signatureHex), message, hexToBytes(publicKeyHex));
  } catch {
    return false;
  }
}
