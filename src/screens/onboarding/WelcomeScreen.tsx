import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import type { OnboardingScreenProps } from '../../types/navigation';

const features = [
  { key: 'feature1', icon: '🏋️' },
  { key: 'feature2', icon: '🤖' },
  { key: 'feature3', icon: '📈' },
] as const;

export function WelcomeScreen({ navigation }: OnboardingScreenProps<'Welcome'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeView>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
            <Text style={styles.logoText}>AI</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.welcome.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.features}>
          {features.map(({ key, icon }) => (
            <View key={key} style={[styles.featureRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t(`onboarding.welcome.${key}`)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title={t('onboarding.welcome.getStarted')}
            onPress={() => navigation.navigate('Goal')}
            size="lg"
            style={styles.button}
          />
          <Text style={[styles.legal, { color: colors.textMuted }]}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  features: { gap: 12, marginBottom: 40 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureIcon: { fontSize: 24 },
  featureText: { fontSize: 15, fontWeight: '500', flex: 1 },
  footer: { paddingBottom: 16, gap: 12 },
  button: { width: '100%' },
  legal: { fontSize: 12, textAlign: 'center' },
});
