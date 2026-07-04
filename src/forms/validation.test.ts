import { isValidSaId, validateField, validateStep } from './validation';
import { MATRIC } from './schemas/matric';
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
