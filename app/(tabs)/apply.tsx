/** Apply: the public services a citizen can consume. Each opens a native form. */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../src/ui/components';
import { colors, font, radius, spacing } from '../../src/ui/theme';
import { SERVICES } from '../../src/forms/registry';

export default function ApplyScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen scroll>
      <Text style={font.h1}>{t('apply.title')}</Text>
      <Text style={font.body}>{t('apply.subtitle')}</Text>

      <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
        {SERVICES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/apply/${s.id}`)}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            style={({ pressed }) => [styles.card, { borderLeftColor: s.accent }, pressed && styles.pressed]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={font.title}>{s.shortTitle}</Text>
              <Text style={font.small}>{s.subtitle}</Text>
              <Text style={[font.label, { color: s.accent, marginTop: spacing.xs }]}>{t('apply.fee')}: {s.fee}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderLeftWidth: 5,
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
});
