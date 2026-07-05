/**
 * Reusable, accessibility-minded UI primitives. Every interactive element has
 * a role, an accessible label where the visible text isn't enough, and a hit
 * target of at least 44×44 dp.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from './theme';

export function Screen({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  const inner = scroll ? (
    <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.screenContent}>{children}</View>
  );
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>{inner}</SafeAreaView>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, accessibilityLabel }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.buttonPrimary,
        !isPrimary && !isDanger && styles.buttonSecondary,
        isDanger && styles.buttonDanger,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[styles.buttonText, !isPrimary && !isDanger && styles.buttonTextSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={font.label}>{label}</Text>
      <Text style={[font.body, styles.rowValue]} selectable>
        {value}
      </Text>
    </View>
  );
}

export function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'success' | 'danger' | 'warning' }) {
  const toneStyle = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    success: { bg: colors.successBg, fg: colors.success },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    warning: { bg: colors.warningBg, fg: colors.warning },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.pillText, { color: toneStyle.fg }]}>{text}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.md,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  buttonDanger: { backgroundColor: colors.danger },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: colors.primary },
  row: { gap: 2, paddingVertical: spacing.xs },
  rowValue: {},
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 13, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
