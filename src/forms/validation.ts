/** Field- and step-level validation for the application forms. */
import type { FormField, FormStep, FormAnswers } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** South African ID: 13 digits with a valid Luhn check digit. */
export function isValidSaId(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = Number(value[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** Returns an error key/message for a field, or null if valid. */
export function validateField(
  field: FormField,
  value: string | boolean | undefined,
  answers: FormAnswers = {}
): string | null {
  if (field.type === 'note') return null;
  const isEmpty = value === undefined || value === '' || value === false;

  const required =
    field.required ||
    (field.requiredWhen !== undefined &&
      field.requiredWhen.equalsAny.includes(String(answers[field.requiredWhen.field] ?? '')));
  if (required && isEmpty) {
    return field.type === 'checkbox' ? 'requiredCheck' : 'required';
  }
  if (isEmpty) return null; // optional + empty → fine

  if (field.type === 'email' && !EMAIL_RE.test(String(value))) return 'email';
  if (field.type === 'idNumber') {
    const luhnApplies = !field.idCheckWhen || answers[field.idCheckWhen.field] === field.idCheckWhen.equals;
    if (luhnApplies && !isValidSaId(String(value))) return 'idNumber';
  }
  if (field.type === 'tel' && !/^\+?[\d\s-]{7,15}$/.test(String(value))) return 'tel';
  if (field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return 'date';
  return null;
}

/** Validate a whole step; returns { fieldName: errorKey }. */
export function validateStep(step: FormStep, answers: FormAnswers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    const err = validateField(field, answers[field.name], answers);
    if (err) errors[field.name] = err;
  }
  return errors;
}
