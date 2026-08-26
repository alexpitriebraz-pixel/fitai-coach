import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeView } from '../../components/common/SafeView';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly, such as your name, age, fitness goals, and workout data. We also collect usage data to improve the app experience.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to provide personalized fitness coaching, generate workout plans, track your progress, and improve our AI systems. We do not sell your personal data to third parties.',
  },
  {
    title: 'AI and Third-Party Services',
    body: 'Our AI coaching feature is powered by Anthropic\'s Claude API. Your messages to the AI coach may be processed by Anthropic. Please review Anthropic\'s privacy policy at anthropic.com.\n\nSubscription management is handled by RevenueCat. Analytics may use Expo\'s built-in services.',
  },
  {
    title: 'Data Storage',
    body: 'Your data is stored locally on your device using AsyncStorage. If you choose to sync with a backend in the future, your data will be encrypted in transit and at rest.',
  },
  {
    title: 'Health Data',
    body: 'Fitness and health data you enter is used solely to provide coaching and track your progress. This data is stored locally and is not shared without your consent.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to:\n• Access your personal data\n• Correct inaccurate data\n• Request deletion of your data\n• Export your data\n\nTo delete your account and all associated data, go to Settings > Delete Account & Data.',
  },
  {
    title: 'Children\'s Privacy',
    body: 'This app is not intended for children under 13. We do not knowingly collect personal information from children under 13.',
  },
  {
    title: 'Contact Us',
    body: 'If you have questions about this privacy policy, please contact us at privacy@fitaicoach.com',
  },
];

export function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeView edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>{t('privacy.lastUpdated')}</Text>

        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Your privacy is important to us. This policy explains how FitAI Coach collects, uses, and protects your personal information.
        </Text>

        {SECTIONS.map(({ title, body }) => (
          <View key={title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20, paddingBottom: 40 },
  lastUpdated: { fontSize: 12 },
  intro: { fontSize: 15, lineHeight: 23 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 22 },
});
