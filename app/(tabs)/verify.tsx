/**
 * Relying-party verification. Scans a citizen's QR presentation and checks it
 * fully offline against the committed trust anchor and revocation list. In a
 * real deployment this is a separate relying-party app; bundling it here lets
 * one device (or two) demonstrate the whole issue→verify loop.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { Screen, Card, Button, Row, Divider } from '../../src/ui/components';
import { colors, font, radius, spacing } from '../../src/ui/theme';
import { issuerName } from '../../src/credential/trust';
import { verifyRaw, type ScanOutcome } from '../../src/credential/scan';
import { claimLabelKey } from '../../src/credential/schema';

type Parsed = ScanOutcome;

export default function VerifyScreen() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);

  // Stop the camera when leaving the tab.
  useFocusEffect(
    React.useCallback(() => {
      return () => setScanning(false);
    }, [])
  );

  const onScanned = (data: string) => {
    if (!scanning) return;
    setScanning(false);
    setParsed(verifyRaw(data));
  };

  if (parsed) {
    return <Result parsed={parsed} onAgain={() => setParsed(null)} />;
  }

  if (scanning && permission?.granted) {
    return (
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => onScanned(data)}
        />
        <View style={styles.reticle} pointerEvents="none" />
        <View style={styles.scanHint} pointerEvents="none">
          <Text style={styles.scanHintText}>{t('verify.scanning')}</Text>
        </View>
        <View style={styles.cancel}>
          <Button title={t('common.cancel')} variant="secondary" onPress={() => setScanning(false)} />
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <Text style={font.h1}>{t('verify.title')}</Text>
      <Text style={font.body}>{t('verify.subtitle')}</Text>

      <View style={styles.illus}>
        <Ionicons name="qr-code-outline" size={96} color={colors.primary} />
      </View>

      {permission && !permission.granted ? (
        <Card>
          <Text style={font.title}>{t('verify.permissionTitle')}</Text>
          <Text style={font.small}>{t('verify.permissionBody')}</Text>
          <Button title={t('verify.grant')} onPress={requestPermission} />
        </Card>
      ) : (
        <Button
          title={t('verify.scan')}
          onPress={async () => {
            if (!permission?.granted) {
              const res = await requestPermission();
              if (!res.granted) return;
            }
            setScanning(true);
          }}
        />
      )}
    </Screen>
  );
}

function Result({ parsed, onAgain }: { parsed: Parsed; onAgain: () => void }) {
  const { t } = useTranslation();
  const { result, schemaId } = parsed;
  const claimEntries = Object.entries(result.claims);

  return (
    <Screen scroll>
      <View style={[styles.verdict, result.valid ? styles.verdictOk : styles.verdictBad]}>
        <Ionicons
          name={result.valid ? 'checkmark-circle' : 'close-circle'}
          size={40}
          color={result.valid ? colors.success : colors.danger}
        />
        <Text style={[font.h2, { color: result.valid ? colors.success : colors.danger }]}>
          {result.valid ? t('verify.valid') : t('verify.invalid')}
        </Text>
      </View>

      {!result.valid && (
        <Card>
          {result.failures.map((f) => (
            <View key={f} style={styles.reasonRow}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={[font.body, { color: colors.danger, flex: 1 }]}>{t(`verify.reasons.${f}`)}</Text>
            </View>
          ))}
        </Card>
      )}

      {result.issuer && (
        <Card>
          <Row label={t('verify.issuer')} value={issuerName(result.issuer) ?? result.issuer} />
          <Divider />
          <Text style={font.label}>{t('verify.disclosed')}</Text>
          {claimEntries.length === 0 ? (
            <Text style={font.small}>{t('verify.nothingDisclosed')}</Text>
          ) : (
            claimEntries.map(([name, value]) => (
              <Row
                key={name}
                label={schemaId ? t(claimLabelKey(schemaId, name)) : name}
                value={String(value)}
              />
            ))
          )}
        </Card>
      )}

      <Text style={[font.small, { textAlign: 'center' }]}>{t('verify.checkedOffline')}</Text>
      <Button title={t('verify.scanAnother')} onPress={onAgain} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  illus: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cameraWrap: { flex: 1, backgroundColor: '#000' },
  reticle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
    width: 240,
    height: 240,
    borderColor: '#fff',
    borderWidth: 3,
    borderRadius: radius.lg,
  },
  scanHint: { position: 'absolute', top: '18%', alignSelf: 'center' },
  scanHintText: { color: '#fff', fontSize: 16, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.sm, borderRadius: radius.sm },
  cancel: { position: 'absolute', bottom: spacing.xxl, left: spacing.xl, right: spacing.xl },
  verdict: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderRadius: radius.lg },
  verdictOk: { backgroundColor: colors.successBg },
  verdictBad: { backgroundColor: colors.dangerBg },
  reasonRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
});
