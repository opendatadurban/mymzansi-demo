import { verifyRaw } from './scan';
import { present } from '../crypto/sdvc';
import { PRESENTATION_QR_PREFIX } from '../crypto/types';
import type { HeldCredential } from '../crypto/types';
import seed from '../../assets/credentials/seed.json';

const held = seed.credentials as unknown as HeldCredential[];
const NOW = Math.floor(Date.now() / 1000);

function qrFor(cred: HeldCredential, claims: string[]): string {
  return PRESENTATION_QR_PREFIX + JSON.stringify(present(cred, claims));
}

describe('verifyRaw (scan entrypoint)', () => {
  it('verifies a well-formed QR string with the prefix', () => {
    const raw = qrFor(held[0], ['fullName', 'city']);
    const { result, schemaId } = verifyRaw(raw, NOW);
    expect(result.valid).toBe(true);
    expect(schemaId).toBe('za.gov.proof-of-address.v1');
    expect(result.claims.city).toBe('Soweto');
  });

  it('also accepts a payload without the prefix', () => {
    const raw = JSON.stringify(present(held[0], ['province']));
    expect(verifyRaw(raw, NOW).result.valid).toBe(true);
  });

  it('returns malformed for arbitrary QR text', () => {
    const { result } = verifyRaw('https://example.com/not-a-credential', NOW);
    expect(result.valid).toBe(false);
    expect(result.failures).toContain('malformed');
  });

  it('returns malformed for truncated JSON', () => {
    const raw = qrFor(held[0], ['fullName']).slice(0, -10);
    expect(verifyRaw(raw, NOW).result.failures).toContain('malformed');
  });

  it('reports revoked for the revoked seed credential', () => {
    const { result } = verifyRaw(qrFor(held[1], ['fullName']), NOW);
    expect(result.failures).toContain('revoked');
  });
});
