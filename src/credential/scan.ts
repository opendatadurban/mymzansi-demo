/**
 * Turn a scanned QR string into a verification result. UI-free so it can be
 * unit-tested in Node. Handles the QR prefix, malformed JSON, and non-credential
 * codes without throwing.
 */
import { verifyScanned } from './trust';
import { PRESENTATION_QR_PREFIX } from '../crypto/types';
import type { Presentation } from '../crypto/types';
import type { VerifyResult } from '../crypto/sdvc';

export interface ScanOutcome {
  result: VerifyResult;
  schemaId?: string;
}

export function verifyRaw(raw: string, now?: number): ScanOutcome {
  try {
    const json = raw.startsWith(PRESENTATION_QR_PREFIX) ? raw.slice(PRESENTATION_QR_PREFIX.length) : raw;
    const presentation = JSON.parse(json) as Presentation;
    const result = verifyScanned(presentation, now);
    return { result, schemaId: presentation?.payload?.schema };
  } catch {
    return { result: { valid: false, failures: ['malformed'], claims: {} } };
  }
}
