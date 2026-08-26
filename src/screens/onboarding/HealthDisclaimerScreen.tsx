import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import type { OnboardingScreenProps } from '../../types/navigation';

export function HealthDisclaimerScreen({ navigation }: OnboardingScreenProps<'HealthDisclaimer'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { completeOnboarding } = useAppStore();
  const [agreed, setAgreed] = useState(false);

  const handleAgree = async () => {
    if (!agreed) {
      Alert.alert('Agreement Required', t('onboarding.disclaimer.mustAgree'));
      return;
    }
    await completeOnboarding();
  };

  return (
    <SafeView>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.disclaimer.title')}</Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('onboarding.disclaimer.body')}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAgreed((a) => !a)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, { borderColor: agreed ? colors.accent : colors.border, backgroundColor: agreed ? colors.accent : 'transparent' }]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>
              I have read and agree to the health disclaimer
            </Text>
          </TouchableOpacity>

          <Button
            title={t('onboarding.disclaimer.agree')}
            onPress={handleAgree}
            disabled={!agreed}
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  iconContainer: { alignSelf: 'center', padding: 20, borderRadius: 50, marginTop: 24, marginBottom: 16 },
  icon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  scroll: { flex: 1, marginBottom: 24 },
  body: { fontSize: 15, lineHeight: 24 },
  footer: { paddingBottom: 16, gap: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  checkLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
  button: { width: '100%' },
});
