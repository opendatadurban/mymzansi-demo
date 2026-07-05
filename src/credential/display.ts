/** Small helpers for rendering held credentials in the UI. */
import { present } from '../crypto/sdvc';
import { verifyScanned } from './trust';
import type { ClaimValue, HeldCredential } from '../crypto/types';

export type CredentialStatus = 'valid' | 'revoked' | 'expired' | 'invalid';

export function getClaim(cred: HeldCredential, name: string): ClaimValue | undefined {
  return cred.disclosures[name]?.[2];
}

/** The wallet-facing status of a held credential (runs a full offline verify). */
export function statusOf(cred: HeldCredential): CredentialStatus {
  const result = verifyScanned(present(cred, Object.keys(cred.disclosures)));
  if (result.valid) return 'valid';
  if (result.failures.includes('revoked')) return 'revoked';
  if (result.failures.includes('expired') || result.failures.includes('not-yet-valid')) return 'expired';
  return 'invalid';
}

export function formatDate(unixSeconds: number, locale: string): string {
  const d = new Date(unixSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
