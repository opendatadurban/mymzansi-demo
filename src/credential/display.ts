/** Small helpers for rendering held credentials in the UI. */
import { present } from '../crypto/sdvc';
import { verifyScanned } from './trust';
import { getSchema } from './schema';
import type { ClaimValue, HeldCredential } from '../crypto/types';

export type CredentialStatus = 'valid' | 'revoked' | 'expired' | 'invalid';

export function getClaim(cred: HeldCredential, name: string): ClaimValue | undefined {
  return cred.disclosures[name]?.[2];
}

/** English labels for the standard credential claim names (used when a schema/meta label is absent). */
const COMMON_CLAIM_LABELS: Record<string, string> = {
  given_name: 'Forenames',
  family_name: 'Surname',
  birth_date: 'Date of birth',
  id_number: 'ID number',
  email_id: 'Email address',
  issuing_authority: 'Issuing authority',
  issue_date: 'Date issued',
  sex: 'Gender',
  marital_status: 'Marital status',
  place_of_birth: 'Place of birth',
  postal_address: 'Postal address',
  citizenship: 'Citizenship',
  grant_status: 'Grant status',
  identity_type: 'Identity type',
  exam_year: 'Exam year',
  exam_number: 'Exam number',
  school_name: 'School',
};

function prettify(name: string): string {
  return name.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

/**
 * Human label for a claim. Prefers a schema-backed i18n label (e.g. proof of
 * address), then a form's own label, then a common/pretty fallback.
 */
export function claimLabel(
  schemaId: string,
  name: string,
  t: (key: string) => string,
  labels?: Record<string, string>
): string {
  const schema = getSchema(schemaId);
  const field = schema?.fields.find((f) => f.name === name);
  if (field) return t(field.labelKey);
  if (labels?.[name]) return labels[name];
  return COMMON_CLAIM_LABELS[name] ?? prettify(name);
}

/** Claim names to reveal by default when presenting (all non-sensitive). */
export function defaultDisclosure(cred: HeldCredential): string[] {
  const sensitive = new Set(sensitiveClaimNames(cred));
  return Object.keys(cred.disclosures).filter((n) => !sensitive.has(n));
}

/** Sensitive claim names for a credential (from its schema or its form meta). */
export function sensitiveClaimNames(cred: HeldCredential): string[] {
  const schema = getSchema(cred.payload.schema);
  if (schema) return schema.fields.filter((f) => f.sensitive).map((f) => f.name);
  return cred.meta?.sensitive ?? [];
}

/** The wallet-facing status of a held credential (runs a full offline verify). */
export function statusOf(cred: HeldCredential): CredentialStatus {
  const result = verifyScanned(present(cred, Object.keys(cred.disclosures)));
  if (result.valid) return 'valid';
  if (result.failures.includes('revoked')) return 'revoked';
  if (result.failures.includes('expired') || result.failures.includes('not-yet-valid')) return 'expired';
  return 'invalid';
}

/** Best-effort holder name for a card: fullName, else given + family name. */
export function holderName(cred: HeldCredential): string {
  const full = getClaim(cred, 'fullName');
  if (full) return String(full);
  return [getClaim(cred, 'given_name'), getClaim(cred, 'family_name')].filter(Boolean).join(' ');
}

export function formatDate(unixSeconds: number, locale: string): string {
  const d = new Date(unixSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
