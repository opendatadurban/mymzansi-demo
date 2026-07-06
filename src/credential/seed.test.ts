/**
 * Guards the boundary between the Node issuer and the RN verifier: the
 * committed demo artifacts must verify against the committed trust anchor.
 * If canonicalisation ever drifts between the two sides, this fails loudly.
 */
import { present, verify } from '../crypto/sdvc';
import type { HeldCredential, SignedStatusList } from '../crypto/types';
import trust from './trust.json';
import seed from '../../assets/credentials/seed.json';
import statusList from '../../assets/credentials/statuslist.json';

const trustedIssuers: Record<string, string> = Object.fromEntries(
  Object.entries(trust.issuers).map(([id, v]) => [id, (v as { publicKeyHex: string }).publicKeyHex])
);

const held = seed.credentials as unknown as HeldCredential[];
const sl = statusList as unknown as SignedStatusList;

// Pin "now" to the committed status list's own issuance time so the suite is
// reproducible and never goes stale as the artifacts age on disk.
const NOW = sl.payload.iat + 3600;

describe('committed seed artifacts', () => {
  it('has a valid credential and a revoked one', () => {
    expect(held).toHaveLength(2);
  });

  it('valid credential verifies fully against the trust anchor', () => {
    const p = present(held[0], Object.keys(held[0].disclosures));
    const r = verify(p, { trustedIssuers, now: NOW, statusList: sl });
    expect(r.failures).toEqual([]);
    expect(r.valid).toBe(true);
    expect(r.claims.city).toBe('Soweto');
  });

  it('revoked credential is rejected by the signed status list', () => {
    const p = present(held[1], Object.keys(held[1].disclosures));
    const r = verify(p, { trustedIssuers, now: NOW, statusList: sl });
    expect(r.valid).toBe(false);
    expect(r.failures).toContain('revoked');
  });

  it('selective disclosure from the seed hides sensitive claims', () => {
    const p = present(held[0], ['city', 'province']);
    const r = verify(p, { trustedIssuers, now: NOW, statusList: sl });
    expect(r.valid).toBe(true);
    expect(r.claims.idNumber).toBeUndefined();
    expect(JSON.stringify(p)).not.toContain('9002204800086');
  });
});
