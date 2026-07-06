/**
 * On-device issuer simulator.
 *
 * Stands in for the government issuing service so the apply→issue→verify loop
 * runs with no backend. Its Ed25519 key is generated on the device and kept in
 * the platform keystore (expo-secure-store) — it is never bundled in the app.
 * On this device the app also trusts this issuer, so credentials it issues from
 * a completed form verify locally.
 *
 * In production, issuance and signing happen server-side (the private key lives
 * in a KMS/HSM), and this issuer's public key would be a committed trust anchor
 * like any other. This is the one deliberate demo shortcut (see the write-up).
 */
import * as SecureStore from 'expo-secure-store';
import { getRandomBytes } from 'expo-crypto';
import { bytesToHex } from '@noble/hashes/utils';
import { publicKeyFromPrivate } from '../crypto/ed25519';
import { registerRuntimeIssuer } from '../credential/trust';
import { issueFromForm } from './issuance';
import type { ServiceForm, FormAnswers } from './types';
import type { HeldCredential } from '../crypto/types';

const KEY = 'mymzansi.issuer.v1';
export const ISSUER_ID = 'did:web:issuer.mymzansi.local';
export const ISSUER_NAME = 'MyMzansi issuing service (demo)';

/** RFC 4122 v4 UUID from secure random bytes (Hermes has no crypto.randomUUID). */
function uuidV4(): string {
  const b = getRandomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
  const h = bytesToHex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function getOrCreateIssuerKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) return existing;
  const priv = bytesToHex(getRandomBytes(32));
  await SecureStore.setItemAsync(KEY, priv, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return priv;
}

/** Register the demo issuer so credentials it issued verify on this device. Call at startup. */
export async function ensureIssuer(): Promise<void> {
  const priv = await getOrCreateIssuerKey();
  registerRuntimeIssuer(ISSUER_ID, publicKeyFromPrivate(priv), ISSUER_NAME);
}

/** Issue the credential for a completed form. The caller adds it to the wallet. */
export async function issueService(form: ServiceForm, answers: FormAnswers): Promise<HeldCredential> {
  const privateKeyHex = await getOrCreateIssuerKey();
  registerRuntimeIssuer(ISSUER_ID, publicKeyFromPrivate(privateKeyHex), ISSUER_NAME);
  return issueFromForm({
    form,
    answers,
    issuerId: ISSUER_ID,
    privateKeyHex,
    now: Math.floor(Date.now() / 1000),
    credentialId: 'urn:uuid:' + uuidV4(),
  });
}
