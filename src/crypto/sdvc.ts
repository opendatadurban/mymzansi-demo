/**
 * Selective-disclosure verifiable credentials over Ed25519.
 *
 *   issue()   — issuer side: sign a set of salted claim digests + metadata
 *   present() — holder side: reveal only the chosen claims
 *   verify()  — relying-party side: check signature, freshness, revocation,
 *               and that each revealed claim is bound to the signature
 *
 * All three share one canonicalisation (see canonical.ts), so a credential
 * minted by the Node issuer verifies unchanged on the phone, fully offline.
 */
import { canonicalBytes, sha256Hex, bytesToHex, type Json } from './canonical';
import { signBytes, verifyBytes } from './ed25519';
import { randomBytes } from './random';
import type {
  ClaimValue,
  CredentialPayload,
  Disclosure,
  HeldCredential,
  Presentation,
  SignedStatusList,
  StatusListPayload,
} from './types';

const SALT_BYTES = 16;

function makeSalt(): string {
  return bytesToHex(randomBytes(SALT_BYTES));
}

/** Digest of a single disclosure = sha-256 over its canonical [salt, name, value]. */
function disclosureDigest(d: Disclosure): string {
  return sha256Hex(d as unknown as Json);
}

export interface IssueInput {
  schema: string;
  issuer: string;
  credentialId: string;
  issuedAt: number;
  expiresAt: number;
  status: { list: string; idx: number };
  claims: Record<string, ClaimValue>;
  privateKeyHex: string;
  meta?: HeldCredential['meta'];
}

/** Issuer: build and sign a credential, returning what the holder should store. */
export function issue(input: IssueInput): HeldCredential {
  const disclosures: Record<string, Disclosure> = {};
  const digests: string[] = [];
  // Deterministic claim order in → deterministic salting is NOT wanted, but the
  // digest array is sorted so payload canonicalisation is stable regardless.
  for (const name of Object.keys(input.claims)) {
    const d: Disclosure = [makeSalt(), name, input.claims[name]];
    disclosures[name] = d;
    digests.push(disclosureDigest(d));
  }
  digests.sort();

  const payload: CredentialPayload = {
    typ: 'sd-vc+ed25519',
    v: 1,
    schema: input.schema,
    iss: input.issuer,
    cid: input.credentialId,
    iat: input.issuedAt,
    exp: input.expiresAt,
    status: input.status,
    sd: digests,
    sd_alg: 'sha-256',
  };
  const signatureHex = signBytes(canonicalBytes(payload), input.privateKeyHex);
  return { payload, signatureHex, disclosures, meta: input.meta };
}

/** Holder: reveal only `claimNames`, keeping everything else hidden. */
export function present(held: HeldCredential, claimNames: string[]): Presentation {
  const disclosures: Disclosure[] = [];
  for (const name of claimNames) {
    const d = held.disclosures[name];
    if (d) disclosures.push(d);
  }
  return { payload: held.payload, signatureHex: held.signatureHex, disclosures };
}

export type VerifyFailure =
  | 'unknown-issuer'
  | 'bad-signature'
  | 'expired'
  | 'not-yet-valid'
  | 'revoked'
  | 'status-list-mismatch'
  | 'status-list-stale'
  | 'status-list-bad-signature'
  | 'malformed'
  | 'disclosure-not-bound';

export interface VerifyOptions {
  /** Trusted issuer public keys, keyed by issuer id (payload.iss). */
  trustedIssuers: Record<string, string>;
  /** Current time, unix seconds (injectable for testing). */
  now: number;
  /** Optional signed status list for offline revocation checking. */
  statusList?: SignedStatusList;
}

export interface VerifyResult {
  valid: boolean;
  failures: VerifyFailure[];
  issuer?: string;
  schema?: string;
  credentialId?: string;
  expiresAt?: number;
  /** Only the claims the holder chose to reveal, name → value. */
  claims: Record<string, ClaimValue>;
}

function checkStatusList(
  payload: CredentialPayload,
  opts: VerifyOptions
): VerifyFailure | null {
  const sl = opts.statusList;
  if (!sl) return null; // no list supplied → revocation not checked (caller's choice)
  const p: StatusListPayload = sl.payload;
  const issuerKey = opts.trustedIssuers[p.iss];
  if (!issuerKey || !verifyBytes(sl.signatureHex, canonicalBytes(p), issuerKey)) {
    return 'status-list-bad-signature';
  }
  if (p.list !== payload.status.list || p.iss !== payload.iss) return 'status-list-mismatch';
  if (opts.now > p.exp) return 'status-list-stale';
  if (p.revoked.includes(payload.status.idx)) return 'revoked';
  return null;
}

/** Relying party: verify a presentation end to end. */
export function verify(presentation: Presentation, opts: VerifyOptions): VerifyResult {
  const failures: VerifyFailure[] = [];
  const claims: Record<string, ClaimValue> = {};

  const payload = presentation?.payload;
  if (!payload || payload.typ !== 'sd-vc+ed25519' || !Array.isArray(payload.sd)) {
    return { valid: false, failures: ['malformed'], claims };
  }

  const issuerKey = opts.trustedIssuers[payload.iss];
  if (!issuerKey) {
    failures.push('unknown-issuer');
  } else if (!verifyBytes(presentation.signatureHex, canonicalBytes(payload), issuerKey)) {
    failures.push('bad-signature');
  }

  if (opts.now > payload.exp) failures.push('expired');
  if (opts.now < payload.iat) failures.push('not-yet-valid');

  const statusFailure = checkStatusList(payload, opts);
  if (statusFailure) failures.push(statusFailure);

  // Each revealed disclosure must hash to a digest present in the signed set.
  const sdSet = new Set(payload.sd);
  for (const d of presentation.disclosures ?? []) {
    if (!Array.isArray(d) || d.length !== 3 || !sdSet.has(disclosureDigest(d))) {
      if (!failures.includes('disclosure-not-bound')) failures.push('disclosure-not-bound');
      continue;
    }
    claims[d[1]] = d[2];
  }

  return {
    valid: failures.length === 0,
    failures,
    issuer: payload.iss,
    schema: payload.schema,
    credentialId: payload.cid,
    expiresAt: payload.exp,
    claims,
  };
}

/** Issuer: sign a revocation status list. */
export function issueStatusList(
  input: Omit<StatusListPayload, 'typ'> & { privateKeyHex: string }
): SignedStatusList {
  const { privateKeyHex, ...rest } = input;
  const payload: StatusListPayload = { typ: 'sd-status-list', ...rest };
  return { payload, signatureHex: signBytes(canonicalBytes(payload), privateKeyHex) };
}
