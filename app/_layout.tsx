// Secure-RNG polyfill (expo-crypto) must load before any crypto runs.
import '../src/crypto/rng';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import i18n, { initI18n } from '../src/i18n';
import { useAuthStore } from '../src/store/authStore';
import { useWalletStore } from '../src/store/walletStore';
import { colors } from '../src/ui/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const initAuth = useAuthStore((s) => s.init);
  const loadWallet = useWalletStore((s) => s.load);

  useEffect(() => {
    (async () => {
      await Promise.all([initI18n(), initAuth(), loadWallet()]);
      setReady(true);
    })();
  }, [initAuth, loadWallet]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="lock" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="credential/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
