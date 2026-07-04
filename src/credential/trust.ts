/**
 * The relying-party (verifier) side of the app, wired to the committed trust
 * anchor and the bundled revocation status list. Everything here runs offline.
 */
import trust from './trust.json';
import statusListJson from '../../assets/credentials/statuslist.json';
import { verify as verifyPresentation, type VerifyResult } from '../crypto/sdvc';
import type { Presentation, SignedStatusList } from '../crypto/types';

export interface IssuerInfo {
  publicKeyHex: string;
  name: string;
}

const issuers = trust.issuers as Record<string, IssuerInfo>;

export const TRUSTED_ISSUERS: Record<string, string> = Object.fromEntries(
  Object.entries(issuers).map(([id, info]) => [id, info.publicKeyHex])
);

export function issuerName(id: string | undefined): string | undefined {
  return id ? issuers[id]?.name : undefined;
}

const bundledStatusList = statusListJson as unknown as SignedStatusList;

/** Verify a scanned presentation offline against the trust anchor + status list. */
export function verifyScanned(presentation: Presentation, now = Math.floor(Date.now() / 1000)): VerifyResult {
  return verifyPresentation(presentation, {
    trustedIssuers: TRUSTED_ISSUERS,
    now,
    statusList: bundledStatusList,
  });
}
