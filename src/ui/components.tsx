/**
 * Reusable UI primitives, built on HeroUI Native (themed via themes/mzansi.css).
 * The exported API is unchanged so screens don't need edits; only the look does.
 * Accessibility: interactive elements expose roles/labels and ≥44dp hit targets.
 */
import React from 'react';
import { StyleSheet, Text, View, ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button as HButton, Surface, Chip, Spinner } from 'heroui-native';
import { colors, font, radius, spacing } from './theme';

export function Screen({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.screenContent}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {inner}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Surface variant="default" style={[styles.card, style]}>
      {children}
    </Surface>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

const VARIANT_MAP = { primary: 'primary', secondary: 'secondary', danger: 'danger' } as const;

export function Button({ title, onPress, variant = 'primary', disabled, loading, accessibilityLabel }: ButtonProps) {
  return (
    <HButton
      variant={VARIANT_MAP[variant]}
      size="lg"
      isDisabled={disabled || loading}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
    >
      {loading ? <Spinner size="sm" color={variant === 'secondary' ? colors.primary : colors.onPrimary} /> : title}
    </HButton>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={font.label}>{label}</Text>
      <Text style={font.body} selectable>
        {value}
      </Text>
    </View>
  );
}

const CHIP_COLOR = { neutral: 'default', success: 'success', danger: 'danger', warning: 'warning' } as const;

export function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'success' | 'danger' | 'warning' }) {
  return (
    <Chip variant="soft" color={CHIP_COLOR[tone]} size="sm">
      <Chip.Label>{text}</Chip.Label>
    </Chip>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  row: { gap: 2, paddingVertical: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
