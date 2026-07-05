/**
 * Native multi-step application runner: renders a ServiceForm step by step,
 * validates, takes a (mocked) payment, then issues the credential into the
 * wallet via the on-device issuer simulator. No WebView anywhere.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button, Divider } from '../../src/ui/components';
import { FormFieldView } from '../../src/ui/FormField';
import { colors, font, spacing } from '../../src/ui/theme';
import { getService } from '../../src/forms/registry';
import { validateStep } from '../../src/forms/validation';
import { issueService } from '../../src/forms/issuerSimulator';
import { useWalletStore } from '../../src/store/walletStore';
import type { FormAnswers } from '../../src/forms/types';

type Phase = { kind: 'step'; index: number } | { kind: 'payment' } | { kind: 'paying' } | { kind: 'done' };

export default function ApplyRunner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const form = getService(id ?? '');
  const router = useRouter();
  const { t } = useTranslation();
  const addCredential = useWalletStore((s) => s.addCredential);

  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>({ kind: 'step', index: 0 });

  if (!form) {
    return (
      <Screen>
        <Text style={font.title}>—</Text>
      </Screen>
    );
  }

  const setField = (name: string, value: string | boolean) => {
    setAnswers((a) => ({ ...a, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  };

  const header = <Stack.Screen options={{ headerShown: true, title: form.shortTitle, headerBackTitle: t('common.back') }} />;

  // ---- Payment (mocked) ----
  if (phase.kind === 'payment' || phase.kind === 'paying') {
    const paying = phase.kind === 'paying';
    const pay = async () => {
      setPhase({ kind: 'paying' });
      const cred = await issueService(form, answers);
      await addCredential(cred);
      setPhase({ kind: 'done' });
    };
    return (
      <Screen scroll>
        {header}
        <Text style={font.h1}>{t('payment.title')}</Text>
        <Card>
          <View style={styles.payRow}>
            <Text style={font.body}>{form.credentialName}</Text>
            <Text style={font.title}>{form.fee}</Text>
          </View>
          <Divider />
          <Text style={font.small}>{t('payment.securedNote')}</Text>
        </Card>
        <Text style={[font.small, styles.demoNote]}>{t('payment.demoNote')}</Text>
        <Button title={paying ? t('payment.processing') : t('payment.pay', { fee: form.fee })} onPress={pay} loading={paying} />
        {!paying && <Button title={t('common.back')} variant="secondary" onPress={() => setPhase({ kind: 'step', index: form.steps.length - 1 })} />}
      </Screen>
    );
  }

  // ---- Success ----
  if (phase.kind === 'done') {
    return (
      <Screen>
        {header}
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          <Text style={font.h2}>{t('success.title')}</Text>
          <Text style={[font.body, { textAlign: 'center' }]}>{t('success.body', { name: form.credentialName })}</Text>
        </View>
        <Button title={t('success.viewWallet')} onPress={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  // ---- A form step ----
  const step = form.steps[phase.index];
  const total = form.steps.length;
  const isLast = phase.index === total - 1;

  const next = () => {
    const stepErrors = validateStep(step, answers);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    if (isLast) setPhase({ kind: 'payment' });
    else setPhase({ kind: 'step', index: phase.index + 1 });
  };

  const back = () => {
    if (phase.index === 0) router.back();
    else setPhase({ kind: 'step', index: phase.index - 1 });
  };

  return (
    <Screen scroll>
      {header}
      <Text style={font.label}>{t('form.step', { current: phase.index + 1, total })}</Text>
      <ProgressBar current={phase.index + 1} total={total} />
      <Text style={font.h2}>{step.title}</Text>
      {!!step.description && <Text style={font.small}>{step.description}</Text>}

      <Card>
        {step.fields.map((field) => (
          <FormFieldView
            key={field.name}
            field={field}
            value={answers[field.name]}
            error={errors[field.name] ? t(`form.errors.${errors[field.name]}`) : undefined}
            onChange={(v) => setField(field.name, v)}
          />
        ))}
      </Card>

      <Button title={isLast ? form.submitLabel : t('form.next')} onPress={next} />
      <Button title={t('common.back')} variant="secondary" onPress={back} />
    </Screen>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progress}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.progressSeg, i < current && styles.progressSegOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  progressSeg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border },
  progressSegOn: { backgroundColor: colors.primary },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  demoNote: { fontStyle: 'italic' },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
});
