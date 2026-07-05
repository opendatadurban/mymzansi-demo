# MyMzansi — Case-study write-up

**What it is:** a native Android app (React Native / Expo) that lets a citizen
hold a government-issued **Proof of Address** credential on their phone and prove
it to a relying party. The relying party checks it — signature, validity and
revocation — **entirely offline**. The app works in **three languages**
(English, isiZulu, Afrikaans).

It is the `Issue → Hold → Verify` slice of the brief's Figure 1, built end to end
and cryptographically real, at the scale a case study warrants.

---

## 1. The public service, and why this one

The service is **proving a verifiable credential to a relying party** — the exact
loop the wider brief is about. A citizen who needs to prove where they live (to
open an account, register for a service, collect a parcel) can do it from their
phone, revealing only what's needed, without handing over a paper bill or their
full ID number.

Choosing this service lets the case study demonstrate the engineering that matters
to the real build: credential issuance and signing, an on-device wallet, offline
verification, revocation, selective disclosure, and a security model that assumes
the app can leak.

## 2. How it works

### Applying for a credential (the Apply tab)
A citizen applies for a government credential through a **native multi-step
form** — matric certificate, SASSA grant, or Smart ID card. These are a
data-driven port of the DPI PoC's SilverStripe UserForms: each form is a schema
(`src/forms`) rendered by one generic native runner, with validation (required
fields, email, SA ID Luhn check) and a stepped wizard. **Nothing is a WebView.**
On completion the citizen pays the application fee (mocked) and the credential is
**issued straight into the wallet**, where it can then be presented and verified.
This proves the first half of the brief's loop — enrol, prove details, issue —
in addition to the hold-and-verify half.

### The credential
A credential is a set of **claims** (name, ID number, address lines, …). Rather
than sign the plaintext, the issuer signs a set of **salted per-claim digests**
plus metadata (issuer, validity window, revocation pointer), using **Ed25519**.
This is an SD-JWT-inspired design. The holder keeps the plaintext claims; the
signature covers all of them as opaque digests.

### Selective disclosure
When presenting, the holder chooses which claims to reveal. The QR code carries
the signed payload plus **only the chosen claims**. The verifier recomputes each
revealed claim's digest and checks it is in the signed set — so revealed claims
are proven genuine, while **undisclosed claims never leave the device** yet remain
bound by the signature. (Verified in tests: an undisclosed ID number does not
appear anywhere in the presentation.)

### Offline verification
The Verify tab scans the QR and checks, with no network:
1. the **signature** against a committed **public trust anchor**,
2. the **validity window** (not expired / not future-dated),
3. **revocation**, against a **signed status list** bundled with the verifier,
4. that every revealed claim is **cryptographically bound** to the signature.

A real deployment refreshes the status list periodically; the verifier rejects a
stale one. The private signing key never touches the device.

### The issuer
[`scripts/issue.ts`](scripts/issue.ts) stands in for the government issuing
service. It mints the Ed25519 key, signs the demo credentials and the status
list, and writes the **public** trust anchor into the app. The private key is
written to a gitignored file — in production it would live in a KMS/HSM and never
be exported. The same engine code issues and verifies, so a credential minted by
the Node issuer verifies unchanged on the phone (guarded by a cross-boundary test).

## 3. Security model

The brief's principle — *the app file can leak; protection lives in the app and
backend, not in distribution* — drove the design:

- **A login gates everything.** First run sets a PIN (stored only as a salted
  scrypt hash); later runs unlock with PIN or biometrics.
- **No usable secret is embedded.** The data-encryption key is generated on the
  device at first launch and kept in the platform keystore (Android Keystore /
  iOS Keychain); it never ships in the binary.
- **Encrypted at rest.** The wallet is serialised and encrypted with
  XChaCha20-Poly1305 (authenticated encryption) under that key, then stored.
- **Privacy by design.** Selective disclosure means a relying party receives only
  what it needs. Tampering with a revealed claim, the payload, or the signature is
  detected and rejected.

## 4. Languages

Three languages, via `i18next` + `expo-localization`: **English, isiZulu,
Afrikaans**. The app auto-selects the device locale on first launch and can be
switched in Settings; the choice is remembered. A unit test enforces that all
three locales have exactly the same keys (no missing or empty strings).

## 5. How it is delivered / access control

- **Distribution:** an EAS **internal-distribution** release APK (profile in
  [`eas.json`](eas.json)), or the Google Play **internal testing** track, where an
  **email allowlist** controls exactly who may install. Either way access is
  limited to named testers — not a public listing.
- **Defence in depth:** even if the APK leaks, the in-app login gate and the
  absence of embedded secrets mean it is not usable by whoever holds the file.

To grant access we register the assessor's device/email on the chosen track and
share the install link.

## 6. Assumptions (per B5)

- **Single-device demo.** Holder and relying party are bundled in one app so the
  whole loop can be shown on one or two phones. In production these are separate
  apps; the verifier needs only the public trust anchor and status list.
- **The issuer is simulated locally.** Two stand-ins for the government issuing
  service: an offline script (`npm run issue`) that pre-signs the proof-of-address
  demo, and an on-device **issuer simulator** that signs credentials completed via
  the Apply forms. The simulator's key is generated on the device and kept in the
  keystore (never bundled); on this device the app also trusts it, so form-issued
  credentials verify locally. In production, issuance is a separate service with
  its key in a KMS/HSM, and its public key is a committed trust anchor. This is the
  one deliberate demo shortcut so the apply→issue→verify loop runs with no backend.
- **Payment is mocked.** The Apply flow shows a real fee and payment step but takes
  no money; a real gateway (card tokenisation, PCI-DSS) is Part A scope. The citizen
  is never charged.
- **Form field content is English.** The app chrome (navigation, buttons,
  validation, payment, wallet) is fully localised in all three languages; the form
  *field labels* are English, translatable via the same mechanism.
- **Canonicalisation** is a deterministic sorted-key JSON serialisation (JCS-like),
  sufficient here because the same function produces the signing input on both
  sides. A production build would adopt full RFC 8785 / a standard VC serialisation.
- **Translations** are natural working translations for the demo; a professional
  native-speaker review is recommended before production.
- **Demo data** (Thandi Nkosi; Sipho Dlamini) is fictional.
- **Payment** is out of scope for this case study (it is a Part A deliverable);
  the citizen is never charged in any case.

## 7. What to look at in the repo

- The engine and its tests: [`src/crypto/sdvc.ts`](src/crypto/sdvc.ts),
  [`src/crypto/sdvc.test.ts`](src/crypto/sdvc.test.ts) — issue/present/verify plus
  every failure mode (tamper, forgery, expiry, revocation, unbound disclosure).
- The issuer↔verifier boundary test:
  [`src/credential/seed.test.ts`](src/credential/seed.test.ts).
- Storage/encryption: [`src/store/secureStorage.ts`](src/store/secureStorage.ts).
- How to run and test: [`README.md`](README.md).

38 unit tests, strict TypeScript, ESLint, and CI (typecheck · lint · test ·
reproducible issuance · Metro bundle) all green.
