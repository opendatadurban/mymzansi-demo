/** Entry gate: route to the lock screen until the wallet is unlocked. */
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const unlocked = useAuthStore((s) => s.unlocked);
  return unlocked ? <Redirect href="/(tabs)" /> : <Redirect href="/lock" />;
}
