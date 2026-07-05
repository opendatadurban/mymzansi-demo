/** Wallet: the citizen's held credentials. Tap one to view and present it. */
import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Button, Pill } from '../../src/ui/components';
import { colors, font, radius, spacing } from '../../src/ui/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { holderName, statusOf, formatDate } from '../../src/credential/display';
import type { HeldCredential } from '../../src/crypto/types';

export default function WalletScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const credentials = useWalletStore((s) => s.credentials);
  const addDemo = useWalletStore((s) => s.addDemoCredentials);
  const [adding, setAdding] = useState(false);

  const onAdd = async () => {
    setAdding(true);
    try {
      await addDemo();
    } finally {
      setAdding(false);
    }
  };

  if (credentials.length === 0) {
    return (
      <Screen>
        <Text style={font.h1}>{t('wallet.title')}</Text>
        <View style={styles.empty}>
          <Ionicons name="wallet-outline" size={64} color={colors.textMuted} />
          <Text style={[font.title, styles.emptyTitle]}>{t('wallet.empty')}</Text>
          <Text style={[font.small, styles.emptyHint]}>{t('wallet.emptyHint')}</Text>
        </View>
        <Button title={t('wallet.addDemo')} onPress={onAdd} loading={adding} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={font.h1}>{t('wallet.title')}</Text>
      <FlatList
        data={credentials}
        keyExtractor={(c) => c.payload.cid}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <CredentialCard
            cred={item}
            locale={i18n.language}
            onPress={() => router.push(`/credential/${encodeURIComponent(item.payload.cid)}`)}
          />
        )}
        ListFooterComponent={
          <View style={{ marginTop: spacing.lg }}>
            <Button title={t('wallet.addDemo')} variant="secondary" onPress={onAdd} loading={adding} />
          </View>
        }
      />
    </Screen>
  );
}

function CredentialCard({ cred, locale, onPress }: { cred: HeldCredential; locale: string; onPress: () => void }) {
  const { t } = useTranslation();
  const status = statusOf(cred);
  const accent = cred.meta?.accent ?? colors.primary;
  const holder = holderName(cred);
  const title = cred.meta?.title ?? t('credential.poa.title');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${holder}`}
      style={({ pressed }) => [styles.card, { borderLeftColor: accent }, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTop}>
        <Text style={font.label}>{cred.meta?.issuerName ?? t('issuer.homeAffairs')}</Text>
        {status === 'valid' && <Pill text={t('wallet.verifiedBadge')} tone="success" />}
        {status === 'revoked' && <Pill text={t('verify.reasons.revoked')} tone="danger" />}
        {status === 'expired' && <Pill text={t('verify.reasons.expired')} tone="warning" />}
      </View>
      <Text style={font.h2}>{title}</Text>
      <Text style={font.body}>{holder}</Text>
      <Text style={font.small}>{t('wallet.expiresOn', { date: formatDate(cred.payload.exp, locale) })}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { marginTop: spacing.md },
  emptyHint: { textAlign: 'center', maxWidth: 260 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderLeftWidth: 5,
    gap: spacing.xs,
  },
  cardPressed: { backgroundColor: colors.surfaceAlt },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
});
