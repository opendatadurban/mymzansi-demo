import type { ServiceForm } from '../types';

/** SASSA grant status — a native port of populate-form-sassa-creds.yml. */
export const SASSA: ServiceForm = {
  id: 'sassa',
  title: 'Add your SASSA grant credential',
  subtitle: 'Prove you are an active SASSA social grant recipient.',
  shortTitle: 'SASSA grant',
  credentialType: 'sassaCredentials',
  credentialName: 'SASSA Grant',
  issuerName: 'South African Social Security Agency',
  accent: '#B8541B',
  fee: 'R 600,00',
  submitLabel: 'Proceed to payment',
  fixedClaims: {
    issuing_authority: 'South African Social Security Agency',
    grant_status: 'Active recipient',
  },
  validityYears: 3,
  steps: [
    {
      title: 'Your identity',
      description: 'These details must match the records held by Home Affairs and SASSA.',
      fields: [
        {
          name: 'identity_type',
          type: 'radio',
          label: 'Identity type',
          required: true,
          claim: 'identity_type',
          options: [
            { value: 'sa_id', label: 'South African ID number' },
            { value: 'asylum', label: 'Asylum seeker / refugee permit number' },
          ],
        },
        { name: 'id_number', type: 'idNumber', label: 'Identification number', hint: 'Your 13-digit ID or permit number', required: true, claim: 'id_number', sensitive: true },
        { name: 'given_name', type: 'text', label: 'Forenames', hint: 'As they appear on your ID document', required: true, claim: 'given_name' },
        { name: 'family_name', type: 'text', label: 'Surname', required: true, claim: 'family_name' },
        { name: 'birth_date', type: 'date', label: 'Date of birth', required: true, claim: 'birth_date' },
      ],
    },
    {
      title: 'Your contact details',
      fields: [
        { name: 'mobile', type: 'tel', label: 'Mobile phone number', required: true },
        { name: 'email_id', type: 'email', label: 'Email address', required: true, claim: 'email_id' },
      ],
    },
  ],
};
