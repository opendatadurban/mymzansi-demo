import { View, Text, StyleSheet } from 'react-native';

/** Placeholder home screen — replaced by the wallet UI in a later batch. */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyMzansi</Text>
      <Text style={styles.subtitle}>Citizen credential wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#14181F' },
  subtitle: { fontSize: 15, color: '#5A6472' },
});
