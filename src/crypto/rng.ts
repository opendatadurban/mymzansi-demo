/**
 * Secure-RNG polyfill for the React Native runtime.
 *
 * @noble/* read `globalThis.crypto.getRandomValues`. Hermes does not provide it,
 * so we back it with expo-crypto — which is available in BOTH Expo Go and
 * dev/production builds, unlike native-only modules. Import this once at the app
 * entry point, before any crypto runs. Idempotent.
 *
 * (Node already provides WebCrypto, so unit tests never need this file.)
 */
import { getRandomValues as expoGetRandomValues } from 'expo-crypto';

const g = globalThis as unknown as { crypto?: { getRandomValues?: (a: ArrayBufferView) => ArrayBufferView } };

if (!g.crypto || typeof g.crypto.getRandomValues !== 'function') {
  g.crypto = {
    ...(g.crypto ?? {}),
    getRandomValues: (array) => expoGetRandomValues(array as Parameters<typeof expoGetRandomValues>[0]),
  };
}
