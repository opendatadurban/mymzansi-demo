/**
 * Secure-RNG bootstrap for the React Native runtime. Import once at the app
 * entry point, before any crypto runs.
 *
 * Hermes does not provide a reliable `globalThis.crypto.getRandomValues`, so we:
 *  1. route the engine's pluggable RNG through expo-crypto (used for salts), and
 *  2. best-effort polyfill `globalThis.crypto.getRandomValues` for any other
 *     consumer.
 *
 * expo-crypto is available in Expo Go and dev/production builds alike.
 * (Node already provides WebCrypto, so unit tests never need this file.)
 */
import { getRandomBytes, getRandomValues as expoGetRandomValues } from 'expo-crypto';
import { setRandomBytes } from './random';

setRandomBytes((length: number) => getRandomBytes(length));

const g = globalThis as unknown as { crypto?: { getRandomValues?: (a: ArrayBufferView) => ArrayBufferView } };
if (!g.crypto || typeof g.crypto.getRandomValues !== 'function') {
  g.crypto = {
    ...(g.crypto ?? {}),
    getRandomValues: (array) => expoGetRandomValues(array as Parameters<typeof expoGetRandomValues>[0]),
  };
}
