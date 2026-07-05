/**
 * Data shapes for the selective-disclosure verifiable credential (SD-VC).
 *
 * The scheme is inspired by SD-JWT (IETF): the issuer signs over a set of
 * salted digests, one per claim, plus credential metadata. The holder keeps
 * the plaintext "disclosures" and reveals only the ones a relying party needs.
 * Undisclosed claims remain hidden yet are still covered by the signature,
 * because their opaque digests are part of the signed payload.
 */

export type ClaimValue = string | number | boolean;

/** A single revealable claim: [salt, claimName, value]. The salt stops guessing of low-entropy values. */
export type Disclosure = [salt: string, name: string, value: ClaimValue];

/** The signed core of the credential. Contains no plaintext claims — only digests. */
export interface CredentialPayload {
  /** Format identifier + version. */
  typ: 'sd-vc+ed25519';
  v: 1;
  /** Credential schema, e.g. "za.gov.proof-of-address.v1". */
  schema: string;
  /** Issuer identifier; used to look up the trusted public key. */
  iss: string;
  /** Credential id (uuid-like). */
  cid: string;
  /** Issued-at / expiry, unix seconds. */
  iat: number;
  exp: number;
  /** Revocation pointer: which status list and which index within it. */
  status: { list: string; idx: number };
  /** Sorted array of claim digests (hex sha-256 of each canonical disclosure). */
  sd: string[];
  /** Digest algorithm, for agility. */
  sd_alg: 'sha-256';
}

/** What the holder stores: the signed payload, the signature, and every disclosure. */
export interface HeldCredential {
  payload: CredentialPayload;
  signatureHex: string;
  /** All disclosures, keyed by claim name for convenient selective presentation. */
  disclosures: Record<string, Disclosure>;
  /** Cosmetic metadata for the wallet UI (not signed). */
  meta?: {
    title?: string;
    issuerName?: string;
    accent?: string;
    /** Claim-name → human label, for credentials issued from a form. */
    labels?: Record<string, string>;
    /** Claim names that are sensitive (hidden by default when presenting). */
    sensitive?: string[];
  };
}

/** What travels in the QR code: the signed payload/signature plus only the chosen disclosures. */
export interface Presentation {
  payload: CredentialPayload;
  signatureHex: string;
  disclosures: Disclosure[];
}

/** A signed revocation list the verifier consults offline. */
export interface StatusListPayload {
  typ: 'sd-status-list';
  list: string;
  iss: string;
  /** Issued-at / valid-until, unix seconds. Verifier rejects a stale list. */
  iat: number;
  exp: number;
  /** Revoked indices within this list. */
  revoked: number[];
}

export interface SignedStatusList {
  payload: StatusListPayload;
  signatureHex: string;
}

export const PRESENTATION_QR_PREFIX = 'SDVC1:';
