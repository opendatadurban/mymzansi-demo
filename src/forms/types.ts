/**
 * Native multi-step application forms (a data-driven port of the SilverStripe
 * DPI PoC UserForms). A citizen applies for a government credential; on
 * completion the app issues that credential into the wallet.
 *
 * Forms are DATA, not screens: adding a service is a schema entry here, and the
 * generic runner in app/apply renders it natively (no WebView).
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'idNumber'
  | 'date'
  | 'radio'
  | 'dropdown'
  | 'checkbox'
  | 'file'
  | 'note';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  /** Unique key within the form; also the answer key. */
  name: string;
  type: FieldType;
  /** Visible label (English; form-content localisation is future work — see write-up). */
  label?: string;
  hint?: string;
  required?: boolean;
  /** For radio/dropdown. */
  options?: FieldOption[];
  /** For 'note' (read-only literal content). */
  content?: string;
  /**
   * If set, this answer is written to the issued credential under this claim
   * name (mirrors the fixtures' MapToCredentialClaimField).
   */
  claim?: string;
  /** Personal data — hidden by default when the holder later presents. */
  sensitive?: boolean;
}

export interface FormStep {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface ServiceForm {
  /** Route id, e.g. 'matric'. */
  id: string;
  /** Service title, e.g. "Apply for a Smart ID card". */
  title: string;
  subtitle: string;
  /** Short label for the services list. */
  shortTitle: string;
  credentialType: string;
  credentialName: string;
  issuerName: string;
  accent: string;
  /** Displayed application fee, e.g. "R 600,00". */
  fee: string;
  submitLabel: string;
  /** Claims baked in regardless of input (hidden fields in the fixtures). */
  fixedClaims?: Record<string, string>;
  /** Credential validity in years from issuance. */
  validityYears: number;
  steps: FormStep[];
}

export type FormAnswers = Record<string, string | boolean>;
