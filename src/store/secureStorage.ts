/**
 * Encryption at rest for wallet data.
 *
 * Envelope model:
 *  - A 256-bit data-encryption key (DEK) is generated once and kept in the
 *    platform keystore via expo-secure-store (Android Keystore / iOS Keychain).
 *    It never leaves secure hardware-backed storage.
 *  - The wallet itself is serialised, encrypted with XChaCha20-Poly1305 (AEAD)
 *    under the DEK, and stored as ciphertext in AsyncStorage. This keeps large
 *    payloads out of SecureStore's small per-value limit while still being
 *    unreadable at rest.
 *
 * No usable secret is embedded in the app binary — the DEK is created on the
 * device at first run. (Matches the brief: "no usable secrets are embedded in
 * the app; the protection lives in the app and the backend.")
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytes } from 'expo-crypto';
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';
import { bytesToUtf8 } from '../crypto/canonical';

/**
 * Cryptographically-secure random bytes from expo-crypto (available in Expo Go
 * and dev/prod builds). We source randomness here directly rather than through
 * @noble's `randomBytes`, which depends on a `globalThis.crypto` that Hermes
 * captures at module-load and may not have populated in time.
 */
function randomBytes(length: number): Uint8Array {
  return getRandomBytes(length);
}

const DEK_KEY = 'mymzansi.dek.v1';
const NONCE_BYTES = 24; // XChaCha20 nonce

/** Fetch the DEK from the keystore, creating it on first use. */
async function getDek(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(DEK_KEY);
  if (existing) return hexToBytes(existing);
  const dek = randomBytes(32);
  await SecureStore.setItemAsync(DEK_KEY, bytesToHex(dek), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return dek;
}

/** Encrypt a JSON-serialisable value; returns "nonceHex.cipherHex". */
export async function encryptJson(value: unknown): Promise<string> {
  const dek = await getDek();
  const nonce = randomBytes(NONCE_BYTES);
  const plaintext = utf8ToBytes(JSON.stringify(value));
  const ciphertext = xchacha20poly1305(dek, nonce).encrypt(plaintext);
  return `${bytesToHex(nonce)}.${bytesToHex(ciphertext)}`;
}

/** Decrypt a value produced by encryptJson. Throws if tampered or wrong key. */
export async function decryptJson<T>(blob: string): Promise<T> {
  const dek = await getDek();
  const [nonceHex, cipherHex] = blob.split('.');
  const plaintext = xchacha20poly1305(dek, hexToBytes(nonceHex)).decrypt(hexToBytes(cipherHex));
  return JSON.parse(bytesToUtf8(plaintext)) as T;
}

/** Store an encrypted value under an AsyncStorage key. */
export async function setEncrypted(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, await encryptJson(value));
}

/** Read and decrypt a value, or return `fallback` if absent/corrupt. */
export async function getEncrypted<T>(key: string, fallback: T): Promise<T> {
  const blob = await AsyncStorage.getItem(key);
  if (!blob) return fallback;
  try {
    return await decryptJson<T>(blob);
  } catch {
    return fallback;
  }
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// --- App-lock PIN (stored as a salted scrypt hash, never plaintext) ---

const PIN_HASH_KEY = 'mymzansi.pinhash.v1';

export async function setPin(pin: string): Promise<void> {
  const { scrypt } = await import('@noble/hashes/scrypt');
  const salt = randomBytes(16);
  const hash = scrypt(utf8ToBytes(pin), salt, { N: 2 ** 13, r: 8, p: 1, dkLen: 32 });
  await SecureStore.setItemAsync(PIN_HASH_KEY, `${bytesToHex(salt)}.${bytesToHex(hash)}`);
}

export async function hasPin(): Promise<boolean> {
  return (await SecureStore.getItemAsync(PIN_HASH_KEY)) !== null;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!stored) return false;
  const { scrypt } = await import('@noble/hashes/scrypt');
  const [saltHex, hashHex] = stored.split('.');
  const hash = scrypt(utf8ToBytes(pin), hexToBytes(saltHex), { N: 2 ** 13, r: 8, p: 1, dkLen: 32 });
  return bytesToHex(hash) === hashHex;
}
