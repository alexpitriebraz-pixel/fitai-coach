import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import i18n, { supportedLocales } from '../../localization';
import type { Language, UnitSystem, Theme } from '../../types';
import type { RootStackParamList } from '../../types/navigation';
import Constants from 'expo-constants';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function SettingsRow({ label, value, onPress, rightElement, destructive, colors }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, { color: destructive ? colors.error : colors.text }]}>{label}</Text>
      {value && <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>}
      {rightElement}
      {onPress && !rightElement && <Text style={{ color: colors.textMuted }}>›</Text>}
    </TouchableOpacity>
  );
}

const languageLabels: Record<Language, string> = {
  en: 'English',
  'pt-BR': 'Português (BR)',
  es: 'Español',
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { settings, setTheme, setLanguage, setUnitSystem, setSettings, deleteAccount } = useAppStore();
  const { isPremium } = useSubscriptionStore();

  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleLanguageChange = () => {
    const current = settings.language;
    const options = supportedLocales.map((l) => ({
      text: languageLabels[l as Language],
      onPress: async () => {
        await setLanguage(l as Language);
        i18n.changeLanguage(l);
      },
    }));
    Alert.alert(t('settings.language'), undefined, [
      ...options,
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleUnitChange = () => {
    const next: UnitSystem = settings.unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(next);
  };

  const handleThemeChange = () => {
    const next: Theme = settings.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <SafeView edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.subscription')}</Text>
          <Card style={styles.card}>
            {isPremium ? (
              <SettingsRow
                label={t('settings.manageSub')}
                onPress={() => {}}
                colors={colors}
              />
            ) : (
              <SettingsRow
                label={t('settings.upgradeToPremium')}
                onPress={() => navigation.navigate('Paywall', { trigger: 'feature' })}
                colors={colors}
                rightElement={
                  <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                }
              />
            )}
          </Card>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <Card style={styles.card}>
            <SettingsRow
              label={t('settings.theme')}
              value={settings.theme === 'dark' ? t('settings.dark') : t('settings.light')}
              onPress={handleThemeChange}
              colors={colors}
            />
            <SettingsRow
              label={t('settings.language')}
              value={languageLabels[settings.language]}
              onPress={handleLanguageChange}
              colors={colors}
            />
            <SettingsRow
              label={t('settings.units')}
              value={settings.unitSystem === 'metric' ? t('settings.kg') : t('settings.lb')}
              onPress={handleUnitChange}
              colors={colors}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.notifications')}</Text>
          <Card style={styles.card}>
            <SettingsRow
              label={t('settings.workoutReminder')}
              colors={colors}
              rightElement={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(val) => setSettings({ notificationsEnabled: val })}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                />
              }
            />
          </Card>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Legal</Text>
          <Card style={styles.card}>
            <SettingsRow
              label={t('settings.privacy')}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              colors={colors}
            />
            <SettingsRow
              label={t('settings.terms')}
              onPress={() => navigation.navigate('TermsOfService')}
              colors={colors}
            />
          </Card>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.account')}</Text>
          <Card style={styles.card}>
            <SettingsRow
              label={t('settings.deleteAccount')}
              onPress={handleDeleteAccount}
              destructive
              colors={colors}
            />
          </Card>
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>{t('settings.version', { version })}</Text>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 0 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 15, flex: 1 },
  rowValue: { fontSize: 14, marginRight: 8 },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  premiumBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
