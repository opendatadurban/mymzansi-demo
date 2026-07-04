import type { Translations } from './en';

/**
 * isiZulu. Translations are natural-language working translations for the demo;
 * a professional native review is recommended before production (noted in the
 * write-up). Brand name "MyMzansi" is kept untranslated.
 */
const zu: Translations = {
  common: {
    appName: 'MyMzansi',
    add: 'Engeza',
    cancel: 'Khansela',
    done: 'Qedile',
    back: 'Emuva',
    close: 'Vala',
    retry: 'Zama futhi',
    continue: 'Qhubeka',
  },
  tabs: {
    wallet: 'Isikhwama',
    verify: 'Qinisekisa',
    settings: 'Izilungiselelo',
  },
  lock: {
    title: 'MyMzansi',
    subtitle: 'Izitifiketi zakho, efonini yakho.',
    createTitle: 'Dala i-PIN',
    createSubtitle: 'Le PIN ivula isikhwama sakho kule divayisi.',
    enterTitle: 'Faka i-PIN yakho',
    confirmTitle: 'Qinisekisa i-PIN yakho',
    mismatch: 'Ama-PIN awafani. Qala kabusha.',
    wrong: 'I-PIN engalungile. Zama futhi.',
    useBiometric: 'Vula nge-biometrics',
    biometricPrompt: 'Vula i-MyMzansi',
    unlock: 'Vula',
  },
  wallet: {
    title: 'Isikhwama Sami',
    empty: 'Awukabi nazitifiketi okwamanje.',
    emptyHint: 'Engeza ubufakazi bekheli lakho ukuze uqale.',
    addDemo: 'Engeza izitifiketi zesibonelo',
    added: 'Izitifiketi zengeziwe esikhwameni sakho.',
    verifiedBadge: 'Kuqinisekisiwe',
    expiresOn: 'Iphelelwa yisikhathi ngo-{{date}}',
  },
  detail: {
    issuedBy: 'Ikhishwe ngu',
    expires: 'Iphelelwa yisikhathi',
    present: 'Yabelana ngalesi sitifiketi',
    presentSubtitle: 'Khetha okuzokwembulwa. Konke okunye kuhlala kufihliwe.',
    showQr: 'Bonisa ikhodi ye-QR',
    qrHint: 'Iqembu elithembekile liyayiskena ukuze liqinisekise isitifiketi sakho.',
    revealAll: 'Embula konke',
    revealMinimal: 'Okuncane',
    sensitive: 'Kubucayi',
    revoked: 'Lesi sitifiketi sichithiwe.',
    remove: 'Susa esikhwameni',
  },
  verify: {
    title: 'Qinisekisa isitifiketi',
    subtitle: 'Skena ikhodi ye-QR yesakhamuzi ukuze uyihlole. Isebenza ungaxhunyiwe ku-inthanethi.',
    scan: 'Skena ikhodi ye-QR',
    scanning: 'Khomba ikhamera kwikhodi ye-QR',
    permissionTitle: 'Kudingeka ukufinyelela kwekhamera',
    permissionBody: 'Vumela ukufinyelela kwekhamera ukuze uskene izitifiketi.',
    grant: 'Vumela ikhamera',
    valid: 'Isitifiketi esisemthethweni',
    invalid: 'Asilona elisemthethweni',
    issuer: 'Umkhiphi',
    disclosed: 'Ulwazi olwembuliwe',
    nothingDisclosed: 'Awukho ama-claim embuliwe.',
    scanAnother: 'Skena esinye',
    checkedOffline: 'Kuhlolwe ungaxhunyiwe ku-inthanethi ngokumelene ne-trust anchor kahulumeni.',
    reasons: {
      'unknown-issuer': 'Umkhiphi akathembekile.',
      'bad-signature': 'Isiginesha ayilungile.',
      expired: 'Isitifiketi siphelelwe yisikhathi.',
      'not-yet-valid': 'Isitifiketi asikabi semthethweni.',
      revoked: 'Isitifiketi sichithiwe.',
      'status-list-mismatch': 'Uhlu lokuchitha aluhambisani.',
      'status-list-stale': 'Uhlu lokuchitha seluphelelwe yisikhathi.',
      'status-list-bad-signature': 'Isiginesha yohlu lokuchitha ayilungile.',
      malformed: 'Ikhodi ye-QR ayilona isitifiketi esisemthethweni.',
      'disclosure-not-bound': 'Idatha eyembuliwe iphazanyisiwe.',
    },
  },
  settings: {
    title: 'Izilungiselelo',
    language: 'Ulimi',
    security: 'Ukuphepha',
    biometrics: 'Vula nge-biometrics',
    lockNow: 'Khiya isikhwama manje',
    about: 'Mayelana',
    aboutBody:
      'I-MyMzansi iyisibonelo sesikhwama sezitifiketi zesakhamuzi. Izitifiketi zigcinwa kudivayisi yakho futhi ziqinisekiswa ungaxhunyiwe ku-inthanethi.',
    version: 'Inguqulo',
  },
  issuer: {
    homeAffairs: 'UMnyango Wezasekhaya',
  },
  credential: {
    poa: { title: 'Ubufakazi Bekheli' },
  },
  claim: {
    poa: {
      fullName: 'Igama eliphelele',
      idNumber: 'Inombolo yomazisi',
      addressLine: 'Ikheli lomgwaqo',
      suburb: 'Idolobhana',
      city: 'Idolobha',
      province: 'Isifundazwe',
      postalCode: 'Ikhodi yeposi',
    },
  },
};

export default zu;
