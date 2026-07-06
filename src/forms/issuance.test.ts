import { buildClaims, issueFromForm } from './issuance';
import { MATRIC } from './schemas/matric';
import { SASSA } from './schemas/sassa';
import { generateKeyPair } from '../crypto/ed25519';
import { present, verify } from '../crypto/sdvc';
import { registerRuntimeIssuer, verifyScanned } from '../credential/trust';
import type { FormAnswers } from './types';

const NOW = 1_750_000_000;
const issuer = generateKeyPair();
const ISSUER_ID = 'did:web:issuer.mymzansi.local';

const matricAnswers: FormAnswers = {
  given_name: 'Thandi',
  family_name: 'Nkosi',
  id_number: '9002204800086',
  birth_date: '1990-02-20',
  exam_year: '2008',
  exam_number: '1234567890123',
  school_name: 'Orlando West Secondary',
  mobile: '0821234567',
  email_id: 'thandi@example.co.za',
};

describe('buildClaims', () => {
  it('maps mapped fields and includes fixed claims', () => {
    const claims = buildClaims(MATRIC, matricAnswers);
    expect(claims.given_name).toBe('Thandi');
    expect(claims.exam_number).toBe('1234567890123');
    expect(claims.issuing_authority).toBe('South African Department of Basic Education');
    expect(claims.mobile).toBeUndefined(); // not a mapped claim
  });

  it('skips empty answers', () => {
    const claims = buildClaims(MATRIC, { given_name: 'A', family_name: '' });
    expect(claims.given_name).toBe('A');
    expect(claims.family_name).toBeUndefined();
  });

  it('stores the option label, not the code, for choice fields', () => {
    const claims = buildClaims(SASSA, { identity_type: 'sa_id', id_number: '8807155555083' });
    expect(claims.identity_type).toBe('South African ID number');
  });
});

describe('issueFromForm → verify', () => {
  it('produces a credential that verifies against the runtime issuer', () => {
    const held = issueFromForm({
      form: MATRIC,
      answers: matricAnswers,
      issuerId: ISSUER_ID,
      privateKeyHex: issuer.privateKeyHex,
      now: NOW,
      credentialId: 'urn:uuid:test-matric',
    });
    const r = verify(present(held, Object.keys(held.disclosures)), {
      trustedIssuers: { [ISSUER_ID]: issuer.publicKeyHex },
      now: NOW,
    });
    expect(r.valid).toBe(true);
    expect(r.claims.school_name).toBe('Orlando West Secondary');
    expect(r.claims.issue_date).toBe(new Date(NOW * 1000).toISOString().slice(0, 10));
    expect(held.meta?.title).toBe('Matric Certificate');
    expect(held.meta?.labels?.given_name).toBe('Forenames');
  });

  it('verifies through verifyScanned once the issuer is registered (no status-list mismatch)', () => {
    registerRuntimeIssuer(ISSUER_ID, issuer.publicKeyHex, 'MyMzansi issuing service (demo)');
    const held = issueFromForm({
      form: SASSA,
      answers: { given_name: 'Sipho', family_name: 'Dlamini', id_number: '8807155555083', birth_date: '1988-07-15', identity_type: 'sa_id', mobile: '0820000000', email_id: 's@e.co' },
      issuerId: ISSUER_ID,
      privateKeyHex: issuer.privateKeyHex,
      now: NOW,
      credentialId: 'urn:uuid:test-sassa',
    });
    const r = verifyScanned(present(held, Object.keys(held.disclosures)), NOW);
    expect(r.failures).toEqual([]);
    expect(r.valid).toBe(true);
    expect(r.claims.grant_status).toBe('Active recipient');
  });

  it('selective disclosure hides the ID number', () => {
    const held = issueFromForm({
      form: MATRIC, answers: matricAnswers, issuerId: ISSUER_ID,
      privateKeyHex: issuer.privateKeyHex, now: NOW, credentialId: 'urn:uuid:x',
    });
    const p = present(held, ['given_name', 'family_name', 'school_name']);
    expect(JSON.stringify(p)).not.toContain('9002204800086');
  });
});
