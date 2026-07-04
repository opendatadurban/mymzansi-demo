/**
 * Wallet state (Zustand). Holds the citizen's credentials, persisted encrypted
 * at rest via the envelope in secureStorage. The wallet also verifies a
 * credential's signature before accepting it, so a tampered import is rejected.
 */
import { create } from 'zustand';
import seed from '../../assets/credentials/seed.json';
import { getEncrypted, setEncrypted } from './secureStorage';
import { present } from '../crypto/sdvc';
import { verifyScanned } from '../credential/trust';
import type { HeldCredential } from '../crypto/types';

const WALLET_KEY = 'mymzansi.wallet.v1';

interface WalletState {
  credentials: HeldCredential[];
  loaded: boolean;
  load: () => Promise<void>;
  /** Import the bundled demo credentials (stands in for receiving them from the issuer). */
  addDemoCredentials: () => Promise<number>;
  remove: (credentialId: string) => Promise<void>;
}

async function persist(credentials: HeldCredential[]): Promise<void> {
  await setEncrypted(WALLET_KEY, credentials);
}

/** A credential is only accepted if its signature verifies against the trust anchor. */
function isAuthentic(cred: HeldCredential): boolean {
  const full = present(cred, Object.keys(cred.disclosures));
  const result = verifyScanned(full);
  // Accept revoked/expired credentials into the wallet (the holder still "has"
  // them); reject only cryptographic failures.
  return !result.failures.some((f) =>
    ['unknown-issuer', 'bad-signature', 'malformed', 'disclosure-not-bound'].includes(f)
  );
}

export const useWalletStore = create<WalletState>((set, get) => ({
  credentials: [],
  loaded: false,

  load: async () => {
    const credentials = await getEncrypted<HeldCredential[]>(WALLET_KEY, []);
    set({ credentials, loaded: true });
  },

  addDemoCredentials: async () => {
    const incoming = (seed.credentials as unknown as HeldCredential[]).filter(isAuthentic);
    const existing = get().credentials;
    const known = new Set(existing.map((c) => c.payload.cid));
    const merged = [...existing, ...incoming.filter((c) => !known.has(c.payload.cid))];
    await persist(merged);
    set({ credentials: merged });
    return merged.length - existing.length;
  },

  remove: async (credentialId: string) => {
    const next = get().credentials.filter((c) => c.payload.cid !== credentialId);
    await persist(next);
    set({ credentials: next });
  },
}));
