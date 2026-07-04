import { generateKeyPair } from './ed25519';
import { issue, present, verify, issueStatusList } from './sdvc';
import type { HeldCredential, SignedStatusList } from './types';

const NOW = 1_750_000_000; // fixed "current time" (unix seconds)
const YEAR = 365 * 24 * 3600;

const issuer = generateKeyPair();
const ISSUER_ID = 'did:web:home-affairs.gov.za';
const LIST = 'poa-2026';

function makeCredential(overrides: Partial<Parameters<typeof issue>[0]> = {}): HeldCredential {
  return issue({
    schema: 'za.gov.proof-of-address.v1',
    issuer: ISSUER_ID,
    credentialId: 'urn:uuid:0001',
    issuedAt: NOW - YEAR,
    expiresAt: NOW + YEAR,
    status: { list: LIST, idx: 7 },
    claims: {
      fullName: 'Thandi Nkosi',
      idNumber: '9002204800086',
      addressLine: '12 Vilakazi Street',
      suburb: 'Orlando West',
      city: 'Soweto',
      province: 'Gauteng',
      postalCode: '1804',
    },
    privateKeyHex: issuer.privateKeyHex,
    ...overrides,
  });
}

function goodStatusList(revoked: number[] = []): SignedStatusList {
  return issueStatusList({
    list: LIST,
    iss: ISSUER_ID,
    iat: NOW - 3600,
    exp: NOW + 3600,
    revoked,
    privateKeyHex: issuer.privateKeyHex,
  });
}

const trusted = () => ({ [ISSUER_ID]: issuer.publicKeyHex });

describe('SD-VC issue → present → verify', () => {
  it('verifies a full-disclosure presentation', () => {
    const held = makeCredential();
    const p = present(held, Object.keys(held.disclosures));
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.valid).toBe(true);
    expect(r.failures).toEqual([]);
    expect(r.claims.fullName).toBe('Thandi Nkosi');
    expect(r.claims.city).toBe('Soweto');
    expect(r.issuer).toBe(ISSUER_ID);
  });

  it('selective disclosure reveals only chosen claims, still valid', () => {
    const held = makeCredential();
    const p = present(held, ['fullName', 'province']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.valid).toBe(true);
    expect(Object.keys(r.claims).sort()).toEqual(['fullName', 'province']);
    expect(r.claims.idNumber).toBeUndefined(); // hidden
  });

  it('undisclosed claims cannot be recovered from the presentation', () => {
    const held = makeCredential();
    const p = present(held, ['province']);
    const serialised = JSON.stringify(p);
    expect(serialised).not.toContain('Thandi Nkosi');
    expect(serialised).not.toContain('9002204800086');
  });
});

describe('SD-VC signature integrity', () => {
  it('rejects an unknown issuer', () => {
    const held = makeCredential();
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: {}, now: NOW });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('unknown-issuer');
  });

  it('rejects a tampered claim value', () => {
    const held = makeCredential();
    const p = present(held, ['city']);
    p.disclosures[0][2] = 'Sandton'; // tamper the revealed value
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('disclosure-not-bound');
  });

  it('rejects a tampered payload (signature no longer matches)', () => {
    const held = makeCredential();
    const p = present(held, ['fullName']);
    p.payload.exp = NOW + 100 * YEAR; // extend validity without re-signing
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('bad-signature');
  });

  it('rejects a forged signature from a different key', () => {
    const attacker = generateKeyPair();
    const held = makeCredential({ privateKeyHex: attacker.privateKeyHex });
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('bad-signature');
  });

  it('returns malformed for junk input', () => {
    const r = verify({ nonsense: true } as unknown as Parameters<typeof verify>[0], {
      trustedIssuers: trusted(),
      now: NOW,
    });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('malformed');
  });
});

describe('SD-VC validity window', () => {
  it('rejects an expired credential', () => {
    const held = makeCredential({ expiresAt: NOW - 1 });
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.failures).toContain('expired');
    expect(r.valid).toBe(false);
  });

  it('rejects a not-yet-valid credential', () => {
    const held = makeCredential({ issuedAt: NOW + 3600 });
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW });
    expect(r.failures).toContain('not-yet-valid');
  });
});

describe('SD-VC revocation via status list', () => {
  it('accepts when the index is not revoked', () => {
    const held = makeCredential();
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW, statusList: goodStatusList([1, 2, 3]) });
    expect(r.valid).toBe(true);
  });

  it('rejects a revoked index', () => {
    const held = makeCredential(); // idx 7
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW, statusList: goodStatusList([7]) });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('revoked');
  });

  it('rejects a stale status list', () => {
    const stale = issueStatusList({
      list: LIST, iss: ISSUER_ID, iat: NOW - 2 * YEAR, exp: NOW - YEAR, revoked: [], privateKeyHex: issuer.privateKeyHex,
    });
    const held = makeCredential();
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW, statusList: stale });
    expect(r.failures).toContain('status-list-stale');
  });

  it('rejects a status list signed by the wrong key', () => {
    const attacker = generateKeyPair();
    const forged = issueStatusList({
      list: LIST, iss: ISSUER_ID, iat: NOW - 3600, exp: NOW + 3600, revoked: [], privateKeyHex: attacker.privateKeyHex,
    });
    const held = makeCredential();
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW, statusList: forged });
    expect(r.failures).toContain('status-list-bad-signature');
  });

  it('rejects a status list for a different list id', () => {
    const other = issueStatusList({
      list: 'some-other-list', iss: ISSUER_ID, iat: NOW - 3600, exp: NOW + 3600, revoked: [], privateKeyHex: issuer.privateKeyHex,
    });
    const held = makeCredential();
    const p = present(held, ['fullName']);
    const r = verify(p, { trustedIssuers: trusted(), now: NOW, statusList: other });
    expect(r.failures).toContain('status-list-mismatch');
  });
});
