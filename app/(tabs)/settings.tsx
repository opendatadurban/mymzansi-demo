/** Settings: language, security, and about. */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { Screen, Card, Button, Divider } from '../../src/ui/components';
import { colors, font, spacing } from '../../src/ui/theme';
import { SUPPORTED_LANGUAGES, changeLanguage, type LanguageCode } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lock = useAuthStore((s) => s.lock);
  const biometricsAvailable = useAuthStore((s) => s.biometricsAvailable);
  const current = i18n.language as LanguageCode;

  const onLock = () => {
    lock();
    router.replace('/lock');
  };

  return (
    <Screen scroll>
      <Text style={font.h1}>{t('settings.title')}</Text>

      <View>
        <Text style={font.label}>{t('settings.language')}</Text>
        <Card style={{ marginTop: spacing.sm, gap: 0 }}>
          {SUPPORTED_LANGUAGES.map((lang, idx) => (
            <React.Fragment key={lang.code}>
              {idx > 0 && <Divider />}
              <Pressable
                onPress={() => changeLanguage(lang.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: current === lang.code }}
                style={styles.langRow}
              >
                <View>
                  <Text style={font.body}>{lang.endonym}</Text>
                  {lang.endonym !== lang.english && <Text style={font.small}>{lang.english}</Text>}
                </View>
                {current === lang.code && <Ionicons name="checkmark" size={22} color={colors.primary} />}
              </Pressable>
            </React.Fragment>
          ))}
        </Card>
      </View>

      <View>
        <Text style={font.label}>{t('settings.security')}</Text>
        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.infoRow}>
            <Ionicons
              name={biometricsAvailable ? 'finger-print' : 'finger-print-outline'}
              size={22}
              color={biometricsAvailable ? colors.primary : colors.textMuted}
            />
            <Text style={[font.body, { flex: 1 }]}>{t('settings.biometrics')}</Text>
            <Text style={font.small}>{biometricsAvailable ? '✓' : '—'}</Text>
          </View>
          <Divider />
          <Button title={t('settings.lockNow')} variant="secondary" onPress={onLock} />
        </Card>
      </View>

      <View>
        <Text style={font.label}>{t('settings.about')}</Text>
        <Card style={{ marginTop: spacing.sm }}>
          <Text style={font.title}>{t('common.appName')}</Text>
          <Text style={font.small}>{t('settings.aboutBody')}</Text>
          <Divider />
          <Text style={font.small}>
            {t('settings.version')} {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
