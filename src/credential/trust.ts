/**
 * The relying-party (verifier) side of the app, wired to the committed trust
 * anchor and the bundled revocation status list. Everything here runs offline.
 *
 * Committed issuers are the real government anchors (public keys only). At
 * runtime the app also registers the demo *issuing service* (see
 * issuerSimulator.ts) so credentials it issues from a completed form verify on
 * this device. In production that issuer is a separate service and its public
 * key would be a committed anchor like any other.
 */
import trust from './trust.json';
import statusListJson from '../../assets/credentials/statuslist.json';
import { verify as verifyPresentation, type VerifyResult } from '../crypto/sdvc';
import type { Presentation, SignedStatusList } from '../crypto/types';

export interface IssuerInfo {
  publicKeyHex: string;
  name: string;
}

const committed = trust.issuers as Record<string, IssuerInfo>;

/** Issuers registered at runtime (e.g. the on-device demo issuing service). */
const runtimeIssuers: Record<string, IssuerInfo> = {};

export function registerRuntimeIssuer(id: string, publicKeyHex: string, name: string): void {
  // A runtime issuer must never shadow a committed government anchor.
  if (committed[id]) throw new Error(`Refusing to override committed trusted issuer "${id}"`);
  runtimeIssuers[id] = { publicKeyHex, name };
}

function allIssuers(): Record<string, IssuerInfo> {
  return { ...committed, ...runtimeIssuers };
}

export function issuerName(id: string | undefined): string | undefined {
  return id ? allIssuers()[id]?.name : undefined;
}

const bundledStatusList = statusListJson as unknown as SignedStatusList;

/** Verify a scanned presentation offline against the trust anchor (+ status list when one applies). */
export function verifyScanned(presentation: Presentation, now = Math.floor(Date.now() / 1000)): VerifyResult {
  const trustedIssuers = Object.fromEntries(
    Object.entries(allIssuers()).map(([id, info]) => [id, info.publicKeyHex])
  );
  // Only apply the bundled status list to credentials that reference it; other
  // issuers publish their own lists (not bundled here), so revocation isn't checked.
  const statusList =
    presentation?.payload?.status?.list === bundledStatusList.payload.list ? bundledStatusList : undefined;
  return verifyPresentation(presentation, { trustedIssuers, now, statusList });
}
