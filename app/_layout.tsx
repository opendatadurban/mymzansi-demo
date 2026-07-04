import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Root layout for the MyMzansi citizen wallet.
 *
 * Scaffolding only for now — a single stack with a placeholder home screen.
 * Auth gating, providers and the tab navigator are added in later batches.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitle: 'MyMzansi' }} />
    </>
  );
}
