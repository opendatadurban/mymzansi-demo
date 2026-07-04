/**
 * Credential schema registry.
 *
 * The wallet is content-driven: a credential "type" is just a schema entry
 * listing its claims, how to label them (i18n keys), which are sensitive, and
 * which to reveal by default when presenting. Swapping the demo from a
 * proof-of-address to, say, a pensioner concession pass is an edit here plus
 * the matching strings — no screen changes.
 */

export interface ClaimField {
  /** Claim name as stored in the credential. */
  name: string;
  /** i18n key for the human label, under `claim.<schema>.<name>`. */
  labelKey: string;
  /** Personal/sensitive data — hidden by default when presenting. */
  sensitive?: boolean;
  /** Included by default in a presentation (a relying party's typical need). */
  defaultDisclose?: boolean;
}

export interface CredentialSchema {
  id: string;
  /** i18n key for the credential's display title. */
  titleKey: string;
  issuerId: string;
  /** i18n key for the issuer's display name. */
  issuerNameKey: string;
  /** Accent colour for the wallet card. */
  accent: string;
  fields: ClaimField[];
}

export const PROOF_OF_ADDRESS: CredentialSchema = {
  id: 'za.gov.proof-of-address.v1',
  titleKey: 'credential.poa.title',
  issuerId: 'did:web:home-affairs.gov.za',
  issuerNameKey: 'issuer.homeAffairs',
  accent: '#0B7A4B',
  fields: [
    { name: 'fullName', labelKey: 'claim.poa.fullName', defaultDisclose: true },
    { name: 'idNumber', labelKey: 'claim.poa.idNumber', sensitive: true },
    { name: 'addressLine', labelKey: 'claim.poa.addressLine', defaultDisclose: true },
    { name: 'suburb', labelKey: 'claim.poa.suburb', defaultDisclose: true },
    { name: 'city', labelKey: 'claim.poa.city', defaultDisclose: true },
    { name: 'province', labelKey: 'claim.poa.province', defaultDisclose: true },
    { name: 'postalCode', labelKey: 'claim.poa.postalCode', defaultDisclose: true },
  ],
};

const REGISTRY: Record<string, CredentialSchema> = {
  [PROOF_OF_ADDRESS.id]: PROOF_OF_ADDRESS,
};

export function getSchema(id: string): CredentialSchema | undefined {
  return REGISTRY[id];
}

/** Label key for a claim, falling back gracefully for unknown schemas/claims. */
export function claimLabelKey(schemaId: string, claimName: string): string {
  const schema = getSchema(schemaId);
  const field = schema?.fields.find((f) => f.name === claimName);
  return field?.labelKey ?? `claim.generic.${claimName}`;
}

export function defaultDisclosedClaims(schemaId: string): string[] {
  const schema = getSchema(schemaId);
  if (!schema) return [];
  return schema.fields.filter((f) => f.defaultDisclose).map((f) => f.name);
}
