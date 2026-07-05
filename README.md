# MyMzansi

A native South African citizen **credential wallet** built with React Native (Expo).
A citizen holds a government-issued **Proof of Address** credential on their phone,
reveals only the fields they choose, and a relying party **verifies it offline** —
signature, expiry and revocation all checked on-device with no network call.

This is the capability case study for the digital credential, verification and
payment brief. See **[WRITEUP.md](WRITEUP.md)** for the plain-English explanation,
the assumptions, and the security model.

> **Languages:** English, isiZulu, Afrikaans (auto-detects the device locale; switchable in Settings).

---

## The loop it proves

```
 Apply (native form)     Pay (mocked)     Issue          Hold                 Present → Verify
 ───────────────────     ────────────     ─────          ────                 ────────────────
 multi-step wizard  ───▶ application ───▶ sign into ───▶ encrypted at rest ──▶ QR → relying party
 (Apply tab)             fee              the wallet     choose what to reveal  verifies offline
```

This is the whole `Apply → Issue → Hold → Verify` journey of the brief's
Figure 1, built native end to end and cryptographically real. A citizen applies
for a government credential in a native form (a data-driven port of the DPI
PoC's SilverStripe UserForms — **no WebView**), pays the fee, and the credential
is issued straight into the wallet, where it can be presented and verified offline.

## Architecture

| Layer | Where | What |
|---|---|---|
| Credential engine | [`src/crypto`](src/crypto) | Ed25519 selective-disclosure VCs (SD-JWT-inspired): `issue` / `present` / `verify`, salted per-claim digests, signed revocation status list. Runtime-agnostic (runs in Node and Hermes). |
| Application forms | [`src/forms`](src/forms) | Data-driven native multi-step forms (matric, SASSA, Smart ID) + validation; an on-device **issuer simulator** signs the completed form into a wallet credential. |
| Issuer | [`scripts/issue.ts`](scripts/issue.ts) | Stands in for the government issuing service. Mints the keypair, signs demo credentials + status list, writes the committed **public** trust anchor. |
| Trust / verify | [`src/credential`](src/credential) | Schema registry (content-driven), trust anchor, offline verification entrypoint. |
| Storage | [`src/store`](src/store) | Envelope encryption at rest — a hardware-backed key (Keystore/Keychain) wrapping an XChaCha20-Poly1305 wallet blob; PIN as a salted scrypt hash. Zustand stores. |
| i18n | [`src/i18n`](src/i18n) | Three locales, device detection, persisted choice, key-parity test. |
| UI | [`app`](app) (expo-router) + [`src/ui`](src/ui) | Lock gate, wallet, credential detail + QR presentation, verify/scan, settings. |

## Running it

Prerequisites: Node 20+, an Android device or emulator. Because the app uses
the camera, secure storage and biometrics, run a **dev build** (not Expo Go).

```bash
npm install                      # uses .npmrc (legacy-peer-deps) for Expo/npm
npm run issue                    # generate the trust anchor + demo credentials
npx expo run:android             # build & launch a dev client on a device/emulator
# or, for a shareable APK on allowlisted testers:
eas build -p android --profile preview
```

Demo flow: create a PIN → **Add demo credentials** → open a credential → toggle
which fields to reveal → **Show QR**. On a second device (or a second install),
open the **Verify** tab and scan it. Try the second, revoked credential to see
revocation caught offline.

## Quality gates

```bash
npm run typecheck    # tsc --noEmit, strict
npm run lint         # eslint (eslint-config-expo)
npm test             # 38 unit tests: engine, canonicalisation, i18n parity, scan
npm run test:coverage
```

[CI](.github/workflows/ci.yml) runs typecheck, lint, tests, a reproducible
issuer↔verifier cross-check, and a Metro Android bundle on every push/PR.

## Project layout

```
app/                 expo-router routes (lock, tabs: wallet/verify/settings, credential/[id])
src/crypto/          Ed25519 SD-VC engine + canonicalisation (+ tests)
src/credential/      schema, trust anchor, verify/scan, display helpers (+ tests)
src/store/           secure storage, wallet + auth stores
src/i18n/            i18next setup + en/zu/af locales (+ parity test)
src/ui/              theme + components
scripts/issue.ts     offline issuer
assets/credentials/  committed signed demo credentials + status list
```

## Security posture (summary)

- **The app file can leak.** A PIN/biometric login gates everything; no usable
  secret is embedded in the binary — the device data key is generated on first run.
- **Encrypted at rest.** Wallet data is AEAD-encrypted under a Keystore/Keychain key.
- **Privacy by design.** Selective disclosure: a verifier receives only the claims
  the holder reveals; the rest never leave the device, yet remain covered by the signature.
- **Offline trust.** Verification uses a committed public trust anchor and a signed
  revocation list — no online dependency, no private key on the device.

Full detail and stated assumptions are in **[WRITEUP.md](WRITEUP.md)**.
