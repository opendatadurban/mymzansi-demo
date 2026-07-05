/** Native renderer for one form field. All field types render natively — no WebView. */
import React from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from './theme';
import type { FormField as FieldDef } from '../forms/types';

interface Props {
  field: FieldDef;
  value: string | boolean | undefined;
  error?: string;
  onChange: (value: string | boolean) => void;
}

export function FormFieldView({ field, value, error, onChange }: Props) {
  if (field.type === 'note') {
    return <Text style={[font.title, styles.note]}>{field.content}</Text>;
  }

  return (
    <View style={styles.wrap}>
      {field.type !== 'checkbox' && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.req}> *</Text>}
        </Text>
      )}
      {!!field.hint && <Text style={styles.hint}>{field.hint}</Text>}

      {renderControl(field, value, onChange)}

      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

function renderControl(field: FieldDef, value: Props['value'], onChange: Props['onChange']) {
  switch (field.type) {
    case 'radio':
    case 'dropdown':
      return (
        <View style={styles.options}>
          {field.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onChange(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? colors.primary : colors.textMuted}
                />
                <Text style={[font.body, styles.optionLabel]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      );

    case 'checkbox':
      return (
        <Pressable
          onPress={() => onChange(!value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!value }}
          style={styles.checkboxRow}
        >
          <Ionicons
            name={value ? 'checkbox' : 'square-outline'}
            size={24}
            color={value ? colors.primary : colors.textMuted}
          />
          <Text style={[font.body, styles.checkboxLabel]}>
            {field.label}
            {field.required && <Text style={styles.req}> *</Text>}
          </Text>
        </Pressable>
      );

    case 'file':
      return (
        <Pressable onPress={() => onChange(value ? '' : 'attached.jpg')} accessibilityRole="button" style={styles.file}>
          <Ionicons name={value ? 'checkmark-circle' : 'cloud-upload-outline'} size={22} color={value ? colors.success : colors.primary} />
          <Text style={[font.body, { color: colors.primary }]}>{value ? 'Photo attached' : 'Choose file'}</Text>
        </Pressable>
      );

    default: {
      const keyboardType =
        field.type === 'email' ? 'email-address' : field.type === 'tel' ? 'phone-pad' : field.type === 'idNumber' ? 'number-pad' : 'default';
      return (
        <TextInput
          style={styles.input}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          keyboardType={keyboardType}
          autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
          placeholder={field.type === 'date' ? 'YYYY-MM-DD' : undefined}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={field.label}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  note: { marginTop: spacing.sm },
  label: { ...font.label, color: colors.text },
  req: { color: colors.danger },
  hint: { ...font.small },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.successBg },
  optionLabel: { flex: 1 },
  checkboxRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingVertical: spacing.sm },
  checkboxLabel: { flex: 1 },
  file: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  error: { ...font.small, color: colors.danger },
});
