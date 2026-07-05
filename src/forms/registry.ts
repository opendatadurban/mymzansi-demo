import type { ServiceForm } from './types';
import { MATRIC } from './schemas/matric';
import { SASSA } from './schemas/sassa';
import { SMART_ID } from './schemas/smartId';

/** The public services a citizen can apply for. Order = display order. */
export const SERVICES: ServiceForm[] = [MATRIC, SASSA, SMART_ID];

export function getService(id: string): ServiceForm | undefined {
  return SERVICES.find((s) => s.id === id);
}
