/**
 * Credential detail + presentation. The holder chooses exactly which claims to
 * reveal (selective disclosure); the QR encodes only those, plus the issuer's
 * signature over the whole set. A relying party scans it on the Verify tab.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Switch } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { Screen, Card, Button, Pill, Divider } from '../../src/ui/components';
import { colors, font, radius, spacing } from '../../src/ui/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { present } from '../../src/crypto/sdvc';
import { PRESENTATION_QR_PREFIX } from '../../src/crypto/types';
import { getClaim, statusOf, formatDate, claimLabel, defaultDisclosure, sensitiveClaimNames } from '../../src/credential/display';

export default function CredentialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cid = decodeURIComponent(id ?? '');
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const cred = useWalletStore((s) => s.credentials.find((c) => c.payload.cid === cid));
  const remove = useWalletStore((s) => s.remove);

  const claimNames = useMemo(() => (cred ? Object.keys(cred.disclosures) : []), [cred]);
  const [selected, setSelected] = useState<Set<string>>(() => (cred ? new Set(defaultDisclosure(cred)) : new Set()));

  if (!cred) {
    return (
      <Screen>
        <Text style={font.title}>—</Text>
      </Screen>
    );
  }

  const status = statusOf(cred);
  const title = cred.meta?.title ?? t('credential.poa.title');

  const toggle = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const setAll = (all: boolean) => setSelected(all ? new Set(claimNames) : new Set());

  const presentation = present(cred, [...selected]);
  const qrValue = PRESENTATION_QR_PREFIX + JSON.stringify(presentation);

  const sensitiveNames = new Set(sensitiveClaimNames(cred));
  const labelFor = (name: string) => claimLabel(cred.payload.schema, name, t, cred.meta?.labels);

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: true, title, headerBackTitle: t('common.back') }} />

      {status === 'revoked' && (
        <View style={styles.banner}>
          <Ionicons name="alert-circle" size={20} color={colors.danger} />
          <Text style={styles.bannerText}>{t('detail.revoked')}</Text>
        </View>
      )}

      <Card>
        <Text style={font.label}>{t('detail.issuedBy')}</Text>
        <Text style={font.title}>{cred.meta?.issuerName ?? t('issuer.homeAffairs')}</Text>
        <Divider />
        <Text style={font.small}>
          {t('detail.expires')}: {formatDate(cred.payload.exp, i18n.language)}
        </Text>
      </Card>

      <Card>
        <Text style={font.title}>{t('detail.present')}</Text>
        <Text style={font.small}>{t('detail.presentSubtitle')}</Text>

        <View style={styles.presetRow}>
          <Pressable onPress={() => setAll(true)} accessibilityRole="button" style={styles.preset}>
            <Text style={styles.presetText}>{t('detail.revealAll')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setSelected(new Set(defaultDisclosure(cred)))}
            accessibilityRole="button"
            style={styles.preset}
          >
            <Text style={styles.presetText}>{t('detail.revealMinimal')}</Text>
          </Pressable>
        </View>

        {claimNames.map((name) => (
          <View key={name} style={styles.claimRow}>
            <View style={styles.claimText}>
              <View style={styles.claimLabelRow}>
                <Text style={font.label}>{labelFor(name)}</Text>
                {sensitiveNames.has(name) && <Pill text={t('detail.sensitive')} tone="warning" />}
              </View>
              <Text style={font.body}>{String(getClaim(cred, name))}</Text>
            </View>
            <Switch
              value={selected.has(name)}
              onValueChange={() => toggle(name)}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel={labelFor(name)}
            />
          </View>
        ))}
      </Card>

      <Card style={styles.qrCard}>
        <Text style={font.title}>{t('detail.showQr')}</Text>
        <View style={styles.qrBox} accessibilityLabel="QR presentation code">
          <QRCode value={qrValue} size={240} ecl="M" backgroundColor="white" color="black" />
        </View>
        <Text style={[font.small, { textAlign: 'center' }]}>{t('detail.qrHint')}</Text>
        {selected.size === 0 && (
          <Text style={[font.small, { textAlign: 'center', color: colors.warning }]}>
            {t('verify.nothingDisclosed')}
          </Text>
        )}
      </Card>

      <Button
        title={t('detail.remove')}
        variant="danger"
        onPress={async () => {
          await remove(cid);
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  bannerText: { ...font.body, color: colors.danger, flex: 1 },
  presetRow: { flexDirection: 'row', gap: spacing.sm },
  preset: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  presetText: { ...font.label, color: colors.primary },
  claimRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  claimText: { flex: 1, gap: 2 },
  claimLabelRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  qrCard: { alignItems: 'center' },
  qrBox: { padding: spacing.lg, backgroundColor: 'white', borderRadius: radius.md },
});
