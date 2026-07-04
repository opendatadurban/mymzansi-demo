import type { Translations } from './en';

/**
 * Afrikaans. Working translations for the demo; professional native review
 * recommended before production. Brand name "MyMzansi" kept untranslated.
 */
const af: Translations = {
  common: {
    appName: 'MyMzansi',
    add: 'Voeg by',
    cancel: 'Kanselleer',
    done: 'Klaar',
    back: 'Terug',
    close: 'Maak toe',
    retry: 'Probeer weer',
    continue: 'Gaan voort',
  },
  tabs: {
    wallet: 'Beursie',
    verify: 'Verifieer',
    settings: 'Instellings',
  },
  lock: {
    title: 'MyMzansi',
    subtitle: 'Jou geloofsbriewe, op jou foon.',
    createTitle: 'Skep ’n PIN',
    createSubtitle: 'Hierdie PIN ontsluit jou beursie op hierdie toestel.',
    enterTitle: 'Voer jou PIN in',
    confirmTitle: 'Bevestig jou PIN',
    mismatch: 'PIN’s stem nie ooreen nie. Begin oor.',
    wrong: 'Verkeerde PIN. Probeer weer.',
    useBiometric: 'Ontsluit met biometrie',
    biometricPrompt: 'Ontsluit MyMzansi',
    unlock: 'Ontsluit',
  },
  wallet: {
    title: 'My Beursie',
    empty: 'Jy het nog geen geloofsbriewe nie.',
    emptyHint: 'Voeg jou Bewys van Adres by om te begin.',
    addDemo: 'Voeg demo-geloofsbriewe by',
    added: 'Geloofsbriewe by jou beursie gevoeg.',
    verifiedBadge: 'Geverifieer',
    expiresOn: 'Verval op {{date}}',
  },
  detail: {
    issuedBy: 'Uitgereik deur',
    expires: 'Verval',
    present: 'Deel hierdie geloofsbrief',
    presentSubtitle: 'Kies wat om te wys. Alles anders bly verborge.',
    showQr: 'Wys QR-kode',
    qrHint: '’n Vertrouende party skandeer dit om jou geloofsbrief te verifieer.',
    revealAll: 'Wys alles',
    revealMinimal: 'Minimaal',
    sensitive: 'Sensitief',
    revoked: 'Hierdie geloofsbrief is herroep.',
    remove: 'Verwyder uit beursie',
  },
  verify: {
    title: 'Verifieer ’n geloofsbrief',
    subtitle: 'Skandeer ’n burger se QR-kode om dit te kontroleer. Werk vanlyn.',
    scan: 'Skandeer QR-kode',
    scanning: 'Rig die kamera op die QR-kode',
    permissionTitle: 'Kameratoegang benodig',
    permissionBody: 'Laat kameratoegang toe om geloofsbriewe te skandeer.',
    grant: 'Laat kamera toe',
    valid: 'Geldige geloofsbrief',
    invalid: 'Nie geldig nie',
    issuer: 'Uitreiker',
    disclosed: 'Bekend gemaakte inligting',
    nothingDisclosed: 'Geen inligting is bekend gemaak nie.',
    scanAnother: 'Skandeer nog een',
    checkedOffline: 'Vanlyn gekontroleer teen die regering se vertrouensanker.',
    reasons: {
      'unknown-issuer': 'Uitreiker word nie vertrou nie.',
      'bad-signature': 'Handtekening is ongeldig.',
      expired: 'Geloofsbrief het verval.',
      'not-yet-valid': 'Geloofsbrief is nog nie geldig nie.',
      revoked: 'Geloofsbrief is herroep.',
      'status-list-mismatch': 'Herroepingslys stem nie ooreen nie.',
      'status-list-stale': 'Herroepingslys is verouderd.',
      'status-list-bad-signature': 'Herroepingslys se handtekening is ongeldig.',
      malformed: 'QR-kode is nie ’n geldige geloofsbrief nie.',
      'disclosure-not-bound': 'Bekend gemaakte data is gemanipuleer.',
    },
  },
  settings: {
    title: 'Instellings',
    language: 'Taal',
    security: 'Sekuriteit',
    biometrics: 'Ontsluit met biometrie',
    lockNow: 'Sluit beursie nou',
    about: 'Aangaande',
    aboutBody:
      'MyMzansi is ’n demonstrasie-burgergeloofsbriefbeursie. Geloofsbriewe word op jou toestel gehou en vanlyn geverifieer.',
    version: 'Weergawe',
  },
  issuer: {
    homeAffairs: 'Departement van Binnelandse Sake',
  },
  credential: {
    poa: { title: 'Bewys van Adres' },
  },
  claim: {
    poa: {
      fullName: 'Volle naam',
      idNumber: 'ID-nommer',
      addressLine: 'Straatadres',
      suburb: 'Voorstad',
      city: 'Stad / Dorp',
      province: 'Provinsie',
      postalCode: 'Poskode',
    },
  },
};

export default af;
