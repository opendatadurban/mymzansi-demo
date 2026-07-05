/** Apply: the public services a citizen can consume. Each opens a native form. */
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';

import { Screen } from '../../src/ui/components';
import { colors, font } from '../../src/ui/theme';
import { SERVICES } from '../../src/forms/registry';

export default function ApplyScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen scroll>
      <Text style={font.h1}>{t('apply.title')}</Text>
      <Text style={font.body}>{t('apply.subtitle')}</Text>

      <View className="gap-3 mt-1">
        {SERVICES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/apply/${s.id}`)}
            accessibilityRole="button"
            accessibilityLabel={s.title}
          >
            <Card style={{ borderLeftWidth: 5, borderLeftColor: s.accent }}>
              <Card.Body className="flex-row items-center gap-3">
                <View className="flex-1 gap-1">
                  <Card.Title>{s.shortTitle}</Card.Title>
                  <Card.Description>{s.subtitle}</Card.Description>
                  <Text style={[font.label, { color: s.accent, marginTop: 4 }]}>
                    {t('apply.fee')}: {s.fee}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
              </Card.Body>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
