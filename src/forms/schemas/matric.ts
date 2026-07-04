import type { ServiceForm } from '../types';

/** Matric certificate — a faithful native port of populate-form-matric-certificate.yml. */
export const MATRIC: ServiceForm = {
  id: 'matric',
  title: 'Digitise your Matric certificate',
  subtitle: 'Add your National Senior Certificate to your wallet.',
  shortTitle: 'Matric certificate',
  credentialType: 'matricCertificate',
  credentialName: 'Matric Certificate',
  issuerName: 'Department of Basic Education',
  accent: '#1F5FA6',
  fee: 'R 600,00',
  submitLabel: 'Proceed to payment',
  fixedClaims: { issuing_authority: 'South African Department of Basic Education' },
  validityYears: 50,
  steps: [
    {
      title: 'Your identity',
      description: 'These details must match your official South African identity document.',
      fields: [
        { name: 'given_name', type: 'text', label: 'Forenames', hint: 'As they appear on your ID document', required: true, claim: 'given_name' },
        { name: 'family_name', type: 'text', label: 'Current surname', required: true, claim: 'family_name' },
        { name: 'previous_surname', type: 'text', label: 'Previous surname', hint: 'If it differed when you took the exam' },
        { name: 'id_number', type: 'idNumber', label: 'South African ID number', required: true, claim: 'id_number', sensitive: true },
        { name: 'birth_date', type: 'date', label: 'Date of birth', required: true, claim: 'birth_date' },
      ],
    },
    {
      title: 'Your matriculation details',
      description: 'Provide the details from the year you wrote your final exams.',
      fields: [
        { name: 'exam_year', type: 'text', label: 'Exam year', required: true, claim: 'exam_year' },
        { name: 'exam_number', type: 'text', label: 'Exam number', hint: 'The 13-digit number on your certificate', required: true, claim: 'exam_number' },
        { name: 'school_name', type: 'text', label: 'Name of school', required: true, claim: 'school_name' },
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
