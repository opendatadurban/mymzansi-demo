/**
 * Offline issuer (run with `npm run issue`).
 *
 * Stands in for the government issuing service in Figure 1 of the brief. It:
 *   1. loads or mints an Ed25519 issuer key,
 *   2. issues signed demo credentials (one valid, one revoked),
 *   3. signs a revocation status list,
 *   4. writes the PUBLIC trust anchor into the app (committed) and the demo
 *      artifacts the wallet imports; the PRIVATE key goes to a gitignored file.
 *
 * The wallet verifies these entirely offline against the committed public key,
 * proving the issue→hold→verify loop without any backend.
 *
 * Reproducible re-issue: set ISSUER_SK=<hex> to reuse a key.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { generateKeyPair, publicKeyFromPrivate } from '../src/crypto/ed25519';
import { issue, issueStatusList } from '../src/crypto/sdvc';
import { PROOF_OF_ADDRESS } from '../src/credential/schema';
import type { HeldCredential, SignedStatusList } from '../src/crypto/types';

const ROOT = join(__dirname, '..');
const TRUST_OUT = join(ROOT, 'src/credential/trust.json');
const SEED_OUT = join(ROOT, 'assets/credentials/seed.json');
const STATUS_OUT = join(ROOT, 'assets/credentials/statuslist.json');
const KEY_OUT = join(ROOT, 'secrets/issuer-dev.json');

const YEAR = 365 * 24 * 3600;
const now = Math.floor(Date.now() / 1000);

function write(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

// 1. Issuer key — reuse from env or gitignored file, else mint a fresh one.
let privateKeyHex: string;
if (process.env.ISSUER_SK) {
  privateKeyHex = process.env.ISSUER_SK.trim();
} else if (existsSync(KEY_OUT)) {
  privateKeyHex = JSON.parse(readFileSync(KEY_OUT, 'utf8')).privateKeyHex;
} else {
  privateKeyHex = generateKeyPair().privateKeyHex;
}
const publicKeyHex = publicKeyFromPrivate(privateKeyHex);
const issuerId = PROOF_OF_ADDRESS.issuerId;
const STATUS_LIST = 'poa-2026';

// 2. Demo credentials. Index 0 is valid; index 5 is revoked below.
const base = {
  schema: PROOF_OF_ADDRESS.id,
  issuer: issuerId,
  issuedAt: now - 30 * 24 * 3600,
  expiresAt: now + YEAR,
  privateKeyHex,
  meta: { title: 'Proof of Address', issuerName: 'Department of Home Affairs', accent: PROOF_OF_ADDRESS.accent },
};

const valid: HeldCredential = issue({
  ...base,
  credentialId: 'urn:uuid:11111111-1111-4111-8111-111111111111',
  status: { list: STATUS_LIST, idx: 0 },
  claims: {
    fullName: 'Thandi Nkosi',
    idNumber: '9002204800086',
    addressLine: '12 Vilakazi Street',
    suburb: 'Orlando West',
    city: 'Soweto',
    province: 'Gauteng',
    postalCode: '1804',
  },
});

const revoked: HeldCredential = issue({
  ...base,
  credentialId: 'urn:uuid:22222222-2222-4222-8222-222222222222',
  status: { list: STATUS_LIST, idx: 5 },
  claims: {
    fullName: 'Sipho Dlamini',
    idNumber: '8807155555083',
    addressLine: '48 Long Street',
    suburb: 'Cape Town City Centre',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
  },
});

// 3. Status list revoking index 5.
const statusList: SignedStatusList = issueStatusList({
  list: STATUS_LIST,
  iss: issuerId,
  iat: now,
  // Long-lived so the committed demo artifacts stay verifiable for assessors.
  // In production the issuer republishes a short-lived list (e.g. weekly) and
  // verifiers reject a stale one — the engine enforces exactly that (`exp`).
  exp: now + 180 * 24 * 3600,
  revoked: [5],
  privateKeyHex,
});

// 4. Write artifacts.
write(TRUST_OUT, {
  note: 'Committed trust anchor. Public keys only — safe to ship in the app.',
  issuers: { [issuerId]: { publicKeyHex, name: 'Department of Home Affairs' } },
});
write(SEED_OUT, { credentials: [valid, revoked] });
write(STATUS_OUT, statusList);
write(KEY_OUT, { privateKeyHex, publicKeyHex, issuerId, warning: 'DEV ONLY. Never commit. Real keys live in a KMS/HSM.' });

console.log('Issued demo credentials and trust anchor:');
console.log('  issuer id      :', issuerId);
console.log('  public key     :', publicKeyHex);
console.log('  trust anchor   → src/credential/trust.json');
console.log('  seed creds     → assets/credentials/seed.json  (1 valid, 1 revoked)');
console.log('  status list    → assets/credentials/statuslist.json  (revokes idx 5)');
console.log('  private key    → secrets/issuer-dev.json  (gitignored)');
