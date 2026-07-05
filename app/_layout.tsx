// Secure-RNG polyfill (expo-crypto) must load before any crypto runs.
import '../src/crypto/rng';
import '../global.css';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { Uniwind } from 'uniwind';
import { I18nextProvider } from 'react-i18next';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import i18n, { initI18n } from '../src/i18n';
import { useAuthStore } from '../src/store/authStore';
import { useWalletStore } from '../src/store/walletStore';
import { ensureIssuer } from '../src/forms/issuerSimulator';
import { colors } from '../src/ui/theme';

Uniwind.setTheme('mzansi-light');

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const initAuth = useAuthStore((s) => s.init);
  const loadWallet = useWalletStore((s) => s.load);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    (async () => {
      await Promise.all([initI18n(), initAuth(), loadWallet(), ensureIssuer()]);
      setReady(true);
    })();
  }, [initAuth, loadWallet]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <I18nextProvider i18n={i18n}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="lock" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="credential/[id]" options={{ presentation: 'card' }} />
              <Stack.Screen name="apply/[id]" options={{ presentation: 'card' }} />
            </Stack>
          </I18nextProvider>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
