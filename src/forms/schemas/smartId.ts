import type { ServiceForm } from '../types';

/** Smart ID card — a native port of populate-form-smart-id-card.yml (6 steps). */
export const SMART_ID: ServiceForm = {
  id: 'smart-id',
  title: 'Apply for a Smart ID card',
  subtitle: 'The South African Smart ID card, in your wallet.',
  shortTitle: 'Smart ID card',
  credentialType: 'smartIdCard',
  credentialName: 'Smart ID Card',
  issuerName: 'Department of Home Affairs',
  accent: '#0B7A4B',
  icon: 'card-outline',
  fee: 'R 600,00',
  submitLabel: 'Proceed to payment',
  fixedClaims: { issuing_authority: 'Department of Home Affairs' },
  validityYears: 10,
  steps: [
    {
      title: 'Application type',
      fields: [
        {
          name: 'application_type',
          type: 'radio',
          label: 'What kind of Smart ID are you applying for?',
          required: true,
          options: [
            { value: 'first', label: 'First issue' },
            { value: 'reissue', label: 'Re-issue' },
            { value: 'replacement', label: 'Replacement' },
          ],
        },
      ],
    },
    {
      title: "Applicant's particulars",
      fields: [
        { name: 'given_name', type: 'text', label: 'Forenames', required: true, claim: 'given_name' },
        { name: 'family_name', type: 'text', label: 'Surname', required: true, claim: 'family_name' },
        { name: 'maiden_name', type: 'text', label: 'Maiden name (if applicable)' },
        { name: 'birth_date', type: 'date', label: 'Date of birth', required: true, claim: 'birth_date' },
        { name: 'place_of_birth', type: 'text', label: 'Place of birth', required: true, claim: 'place_of_birth' },
        { name: 'id_number', type: 'idNumber', label: 'South African ID number (if a re-issue)', claim: 'id_number', sensitive: true },
        {
          name: 'sex',
          type: 'radio',
          label: 'Gender',
          required: true,
          claim: 'sex',
          options: [
            { value: 'F', label: 'Female' },
            { value: 'M', label: 'Male' },
          ],
        },
        {
          name: 'marital_status',
          type: 'radio',
          label: 'Marital status',
          required: true,
          claim: 'marital_status',
          options: [
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widowed', label: 'Widowed' },
          ],
        },
      ],
    },
    {
      title: 'Contact details',
      fields: [
        { name: 'postal_address', type: 'text', label: 'Postal address', required: true, claim: 'postal_address' },
        { name: 'contact_number', type: 'tel', label: 'Contact number', required: true },
        { name: 'email_id', type: 'email', label: 'Email address', required: true, claim: 'email_id' },
      ],
    },
    {
      title: 'Citizenship particulars',
      fields: [
        {
          name: 'citizenship',
          type: 'radio',
          label: 'How was South African citizenship acquired?',
          required: true,
          claim: 'citizenship',
          options: [
            { value: 'birth', label: 'By birth' },
            { value: 'descent', label: 'By descent' },
            { value: 'naturalisation', label: 'By naturalisation' },
          ],
        },
        { name: 'certificate_number', type: 'text', label: 'Certificate number (if applicable)', hint: 'E.g. for citizenship by descent or naturalisation' },
        { name: 'photo_id', type: 'file', label: 'Upload verified photo ID' },
      ],
    },
    {
      title: 'Particulars of parents',
      fields: [
        { name: 'parent1_heading', type: 'note', content: 'Parent 1 details' },
        { name: 'parent1_surname', type: 'text', label: 'Surname' },
        { name: 'parent1_forenames', type: 'text', label: 'Forenames' },
        { name: 'parent1_id', type: 'idNumber', label: 'ID number', sensitive: true },
        { name: 'parent2_heading', type: 'note', content: 'Parent 2 details' },
        { name: 'parent2_surname', type: 'text', label: 'Surname' },
        { name: 'parent2_forenames', type: 'text', label: 'Forenames' },
        { name: 'parent2_id', type: 'idNumber', label: 'ID number', sensitive: true },
      ],
    },
    {
      title: 'Photo and declaration',
      fields: [
        { name: 'portrait', type: 'file', label: 'Upload a photo of yourself' },
        {
          name: 'declaration',
          type: 'checkbox',
          label: 'I declare that the information in this application is true and correct to the best of my knowledge.',
          required: true,
        },
      ],
    },
  ],
};
