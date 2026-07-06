import { isValidSaId, validateField, validateStep } from './validation';
import { MATRIC } from './schemas/matric';
import { SASSA } from './schemas/sassa';
import { SMART_ID } from './schemas/smartId';
import type { FormField } from './types';

describe('isValidSaId', () => {
  it('accepts a valid 13-digit SA ID (Luhn)', () => {
    expect(isValidSaId('8001015009087')).toBe(true);
  });
  it('rejects wrong length', () => {
    expect(isValidSaId('123')).toBe(false);
  });
  it('rejects a bad check digit', () => {
    expect(isValidSaId('8001015009088')).toBe(false);
  });
  it('rejects non-digits', () => {
    expect(isValidSaId('90022048000ab')).toBe(false);
  });
});

describe('validateField', () => {
  const f = (over: Partial<FormField>): FormField => ({ name: 'x', type: 'text', ...over });

  it('flags required empties', () => {
    expect(validateField(f({ required: true }), '')).toBe('required');
    expect(validateField(f({ required: true, type: 'checkbox' }), false)).toBe('requiredCheck');
  });
  it('allows optional empties', () => {
    expect(validateField(f({}), '')).toBeNull();
  });
  it('validates email / tel / date / id formats', () => {
    expect(validateField(f({ type: 'email' }), 'nope')).toBe('email');
    expect(validateField(f({ type: 'email' }), 'a@b.co')).toBeNull();
    expect(validateField(f({ type: 'tel' }), '12')).toBe('tel');
    expect(validateField(f({ type: 'date' }), '2020-1-1')).toBe('date');
    expect(validateField(f({ type: 'date' }), '2020-01-01')).toBeNull();
    expect(validateField(f({ type: 'idNumber' }), '8001015009087')).toBeNull();
  });
});

describe('conditional validation', () => {
  const base = { given_name: 'A', family_name: 'B', birth_date: '1990-02-20' };

  it('SASSA: Luhn-checks the SA-ID route', () => {
    const errors = validateStep(SASSA.steps[0], { ...base, identity_type: 'sa_id', id_number: 'not-an-id' });
    expect(errors.id_number).toBe('idNumber');
  });
  it('SASSA: accepts a permit number on the asylum route', () => {
    const errors = validateStep(SASSA.steps[0], { ...base, identity_type: 'asylum', id_number: 'PTA-0012345/2019' });
    expect(errors).toEqual({});
  });
  it('SASSA: the permit number is still required', () => {
    const errors = validateStep(SASSA.steps[0], { ...base, identity_type: 'asylum' });
    expect(errors.id_number).toBe('required');
  });
  it('Smart ID: the ID number is required for a re-issue but not a first issue', () => {
    const idField = SMART_ID.steps[1].fields.find((f) => f.name === 'id_number')!;
    expect(validateField(idField, '', { application_type: 'reissue' })).toBe('required');
    expect(validateField(idField, '', { application_type: 'first' })).toBeNull();
  });
});

describe('validateStep (matric step 1)', () => {
  it('reports every missing required field', () => {
    const errors = validateStep(MATRIC.steps[0], {});
    expect(errors.given_name).toBe('required');
    expect(errors.family_name).toBe('required');
    expect(errors.id_number).toBe('required');
    expect(errors.previous_surname).toBeUndefined(); // optional
  });
  it('passes when required fields are valid', () => {
    const errors = validateStep(MATRIC.steps[0], {
      given_name: 'Thandi',
      family_name: 'Nkosi',
      id_number: '8001015009087',
      birth_date: '1990-02-20',
    });
    expect(errors).toEqual({});
  });
});
