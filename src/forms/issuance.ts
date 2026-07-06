/**
 * Turn completed form answers into a signed, wallet-ready credential.
 *
 * Pure and runtime-agnostic (testable in Node). The RN issuer simulator
 * (issuerSimulator.ts) supplies the signing key, a credential id and the time.
 */
import { issue } from '../crypto/sdvc';
import type { HeldCredential } from '../crypto/types';
import type { ServiceForm, FormAnswers } from './types';

const YEAR = 365 * 24 * 3600;

/** Collect the credential claims from mapped fields + the form's fixed claims. */
export function buildClaims(form: ServiceForm, answers: FormAnswers): Record<string, string> {
  const claims: Record<string, string> = {};
  for (const step of form.steps) {
    for (const field of step.fields) {
      if (!field.claim) continue;
      const v = answers[field.name];
      if (v === undefined || v === '' || v === false) continue;
      // Choice fields store the human label ("Female"), not the option code ("F") —
      // the claim is what a relying party reads on the verify screen.
      const option = field.options?.find((o) => o.value === v);
      claims[field.claim] = option ? option.label : String(v);
    }
  }
  return { ...claims, ...(form.fixedClaims ?? {}) };
}

/** Claim-name → human label, so the wallet can render a form-issued credential. */
export function labelsForForm(form: ServiceForm): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const step of form.steps) {
    for (const field of step.fields) {
      if (field.claim && field.label) labels[field.claim] = field.label;
    }
  }
  if (form.fixedClaims?.issuing_authority) labels.issuing_authority = 'Issuing authority';
  if (form.fixedClaims?.grant_status) labels.grant_status = 'Grant status';
  labels.issue_date = 'Date issued';
  return labels;
}

export interface IssueFromFormInput {
  form: ServiceForm;
  answers: FormAnswers;
  issuerId: string;
  privateKeyHex: string;
  /** Current time, unix seconds. */
  now: number;
  credentialId: string;
}

export function issueFromForm(input: IssueFromFormInput): HeldCredential {
  const { form, answers, issuerId, privateKeyHex, now, credentialId } = input;
  const claims = buildClaims(form, answers);
  claims.issue_date = new Date(now * 1000).toISOString().slice(0, 10);

  return issue({
    schema: form.credentialType,
    issuer: issuerId,
    credentialId,
    issuedAt: now,
    expiresAt: now + form.validityYears * YEAR,
    // Form-issued demo credentials have no published revocation list; the
    // verifier simply doesn't apply one for this list id.
    status: { list: 'mymzansi-issued', idx: 0 },
    claims,
    privateKeyHex,
    meta: {
      title: form.credentialName,
      issuerName: form.issuerName,
      accent: form.accent,
      labels: labelsForForm(form),
      sensitive: sensitiveClaims(form),
    },
  });
}

/** Claim names the form marked sensitive (hidden by default when presenting). */
export function sensitiveClaims(form: ServiceForm): string[] {
  const names: string[] = [];
  for (const step of form.steps) {
    for (const field of step.fields) {
      if (field.claim && field.sensitive) names.push(field.claim);
    }
  }
  return names;
}
