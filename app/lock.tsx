/**
 * App-lock gate. First run creates a PIN (with confirmation); later runs unlock
 * with the PIN or biometrics. A login gates everything (brief: "A login gates
 * everything"). The PIN never leaves the device and is stored only as a hash.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../src/store/authStore';
import { colors, font, radius, spacing } from '../src/ui/theme';

const PIN_LENGTH = 5;
type Mode = 'create' | 'confirm' | 'enter';

export default function LockScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { hasPin, unlocked, biometricsAvailable, createPin, tryPin, tryBiometrics } = useAuthStore();

  const [mode, setMode] = useState<Mode>(hasPin ? 'enter' : 'create');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unlocked) router.replace('/(tabs)');
  }, [unlocked, router]);

  const promptBiometrics = useCallback(async () => {
    if (biometricsAvailable && hasPin) await tryBiometrics(t('lock.biometricPrompt'));
  }, [biometricsAvailable, hasPin, tryBiometrics, t]);

  useEffect(() => {
    // Offer biometrics automatically on an unlock screen.
    if (mode === 'enter') void promptBiometrics();
  }, [mode, promptBiometrics]);

  const submit = useCallback(
    async (value: string) => {
      if (mode === 'create') {
        setFirstPin(value);
        setPin('');
        setMode('confirm');
        return;
      }
      if (mode === 'confirm') {
        if (value === firstPin) {
          await createPin(value);
        } else {
          setError(t('lock.mismatch'));
          setFirstPin('');
          setPin('');
          setMode('create');
        }
        return;
      }
      // enter
      const ok = await tryPin(value);
      if (!ok) {
        setError(t('lock.wrong'));
        setPin('');
      }
    },
    [mode, firstPin, createPin, tryPin, t]
  );

  const onDigit = useCallback(
    (d: string) => {
      setError(null);
      setPin((prev) => {
        if (prev.length >= PIN_LENGTH) return prev;
        const next = prev + d;
        if (next.length === PIN_LENGTH) void submit(next);
        return next;
      });
    },
    [submit]
  );

  const onDelete = useCallback(() => setPin((p) => p.slice(0, -1)), []);

  const heading =
    mode === 'create' ? t('lock.createTitle') : mode === 'confirm' ? t('lock.confirmTitle') : t('lock.enterTitle');
  const sub = mode === 'create' ? t('lock.createSubtitle') : mode === 'enter' ? t('lock.subtitle') : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.brand}>{t('lock.title')}</Text>
        <Text style={styles.heading}>{heading}</Text>
        {!!sub && <Text style={styles.sub}>{sub}</Text>}
        <View style={styles.dots} accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
          ))}
        </View>
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error ?? ' '}
        </Text>
      </View>

      <Keypad onDigit={onDigit} onDelete={onDelete} />

      {mode === 'enter' && biometricsAvailable && (
        <Pressable onPress={promptBiometrics} accessibilityRole="button" style={styles.bio}>
          <Text style={styles.bioText}>{t('lock.useBiometric')}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function Keypad({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <View style={styles.keypad}>
      {keys.map((k, i) => {
        if (k === '') return <View key={i} style={styles.key} />;
        const isDel = k === 'del';
        return (
          <Pressable
            key={i}
            onPress={() => (isDel ? onDelete() : onDigit(k))}
            accessibilityRole="button"
            accessibilityLabel={isDel ? 'Delete' : k}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text style={styles.keyText}>{isDel ? '⌫' : k}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between', padding: spacing.xl },
  top: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.sm },
  brand: { ...font.label, color: colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  heading: { ...font.h2, marginTop: spacing.md },
  sub: { ...font.small, textAlign: 'center', maxWidth: 300 },
  dots: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { ...font.small, color: colors.danger, minHeight: 18, marginTop: spacing.sm },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: {
    width: '30%',
    aspectRatio: 1.8,
    maxHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.5%',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  keyPressed: { backgroundColor: colors.surfaceAlt },
  keyText: { fontSize: 26, fontWeight: '500', color: colors.text },
  bio: { alignItems: 'center', paddingVertical: spacing.lg },
  bioText: { ...font.title, color: colors.primary },
});
