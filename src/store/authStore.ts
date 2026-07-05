/**
 * App-lock state (Zustand). A PIN gates the wallet on every cold start; an
 * optional biometric unlock is offered when the device supports it. The PIN is
 * stored only as a salted scrypt hash (see secureStorage), never in plaintext.
 */
import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import { hasPin, setPin as persistPin, verifyPin } from './secureStorage';

interface AuthState {
  ready: boolean;
  hasPin: boolean;
  unlocked: boolean;
  biometricsAvailable: boolean;
  init: () => Promise<void>;
  createPin: (pin: string) => Promise<void>;
  tryPin: (pin: string) => Promise<boolean>;
  tryBiometrics: (prompt: string) => Promise<boolean>;
  lock: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  hasPin: false,
  unlocked: false,
  biometricsAvailable: false,

  init: async () => {
    const [pinSet, hasHardware, enrolled] = await Promise.all([
      hasPin(),
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    set({ ready: true, hasPin: pinSet, biometricsAvailable: hasHardware && enrolled });
  },

  createPin: async (pin: string) => {
    await persistPin(pin);
    set({ hasPin: true, unlocked: true });
  },

  tryPin: async (pin: string) => {
    const ok = await verifyPin(pin);
    if (ok) set({ unlocked: true });
    return ok;
  },

  tryBiometrics: async (prompt: string) => {
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: prompt });
    if (res.success) set({ unlocked: true });
    return res.success;
  },

  lock: () => set({ unlocked: false }),
}));
