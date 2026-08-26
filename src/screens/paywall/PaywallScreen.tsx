import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { getOfferings, purchasePackage, restorePurchases } from '../../services/revenueCat';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { FREE_DAILY_MESSAGE_LIMIT } from '../../constants';

const PREMIUM_FEATURES = [
  'feature1',
  'feature2',
  'feature3',
  'feature4',
] as const;

export function PaywallScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { setIsPremium, dailyMessagesUsed } = useSubscriptionStore();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const off = await getOfferings();
      setOffering(off);
      if (off?.monthly) setSelectedPkg(off.monthly);
    } catch {
      // Use mock
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    try {
      const success = await purchasePackage(selectedPkg);
      if (success) {
        await setIsPremium(true);
        Alert.alert('Welcome to Premium! 🎉', 'Enjoy unlimited AI coaching.', [
          { text: 'Let\'s Go!', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Purchase Failed', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        await setIsPremium(true);
        Alert.alert('Restored!', 'Your Premium subscription has been restored.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('No Purchase Found', 'No previous Premium subscription found.');
      }
    } catch {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const isTriggerLimit = route.params?.trigger === 'message_limit';

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.crownBox, { backgroundColor: `${colors.accent}20` }]}>
            <Text style={styles.crown}>👑</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('paywall.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('paywall.subtitle')}</Text>
          {isTriggerLimit && (
            <View style={[styles.limitBanner, { backgroundColor: `${colors.error}15` }]}>
              <Text style={[styles.limitBannerText, { color: colors.error }]}>
                {t('paywall.limitMessage', { limit: FREE_DAILY_MESSAGE_LIMIT })}
              </Text>
            </View>
          )}
        </View>

        {/* Feature comparison */}
        <View style={styles.comparison}>
          <View style={[styles.freeCol, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.planLabel, { color: colors.textSecondary }]}>{t('paywall.freePlan')}</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>$0</Text>
            <FeatureItem text={`${FREE_DAILY_MESSAGE_LIMIT} AI messages/day`} included={true} colors={colors} />
            <FeatureItem text="Workout logging" included={true} colors={colors} />
            <FeatureItem text="Exercise library" included={true} colors={colors} />
            <FeatureItem text="Unlimited AI chat" included={false} colors={colors} />
            <FeatureItem text="Custom plans" included={false} colors={colors} />
            <FeatureItem text="Advanced analytics" included={false} colors={colors} />
          </View>

          <View style={[styles.premiumCol, { backgroundColor: colors.accent, borderColor: colors.accentDark }]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
            <Text style={[styles.planLabel, { color: 'rgba(255,255,255,0.8)' }]}>{t('paywall.premiumPlan')}</Text>
            <Text style={[styles.planPrice, { color: '#fff' }]}>
              {offering?.monthly?.product.priceString ?? '$9.99'}<Text style={styles.per}>/mo</Text>
            </Text>
            {PREMIUM_FEATURES.map((key) => (
              <FeatureItem key={key} text={t(`paywall.${key}`)} included={true} premium colors={colors} />
            ))}
          </View>
        </View>

        {/* Package selection */}
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : offering ? (
          <View style={styles.packages}>
            {offering.availablePackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.packageBtn,
                  {
                    backgroundColor: selectedPkg?.identifier === pkg.identifier ? `${colors.accent}20` : colors.surface,
                    borderColor: selectedPkg?.identifier === pkg.identifier ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setSelectedPkg(pkg)}
              >
                <View>
                  <Text style={[styles.pkgName, { color: colors.text }]}>
                    {pkg.packageType === 'ANNUAL' ? 'Annual' : 'Monthly'}
                  </Text>
                  {pkg.packageType === 'ANNUAL' && (
                    <Text style={[styles.pkgSave, { color: colors.success }]}>Save 50%</Text>
                  )}
                </View>
                <Text style={[styles.pkgPrice, { color: colors.accent }]}>
                  {pkg.product.priceString}
                  <Text style={[styles.pkgPer, { color: colors.textSecondary }]}>
                    {pkg.packageType === 'ANNUAL' ? '/yr' : '/mo'}
                  </Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* CTA */}
        <Button
          title={t('paywall.subscribe')}
          onPress={handlePurchase}
          loading={purchasing}
          size="lg"
          style={styles.cta}
        />

        <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
          <Text style={[styles.restore, { color: colors.textSecondary }]}>{t('paywall.restore')}</Text>
        </TouchableOpacity>

        <Text style={[styles.terms, { color: colors.textMuted }]}>{t('paywall.terms')}</Text>
      </ScrollView>
    </SafeView>
  );
}

function FeatureItem({
  text,
  included,
  premium,
  colors,
}: {
  text: string;
  included: boolean;
  premium?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={featureStyles.row}>
      <Text style={featureStyles.icon}>{included ? '✓' : '✗'}</Text>
      <Text style={[featureStyles.text, { color: premium ? '#fff' : included ? colors.text : colors.textMuted }]}>
        {text}
      </Text>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  icon: { fontSize: 14, width: 18 },
  text: { flex: 1, fontSize: 13, lineHeight: 19 },
});

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  closeBtnText: { fontSize: 18, fontWeight: '700' },
  hero: { alignItems: 'center', gap: 10, marginBottom: 28 },
  crownBox: { padding: 20, borderRadius: 40, marginBottom: 4 },
  crown: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center' },
  limitBanner: { padding: 12, borderRadius: 10, width: '100%' },
  limitBannerText: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  comparison: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  freeCol: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1 },
  premiumCol: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, position: 'relative' },
  planLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  planPrice: { fontSize: 22, fontWeight: '800', marginBottom: 14, color: '#fff' },
  per: { fontSize: 14, fontWeight: '400' },
  popularBadge: { position: 'absolute', top: -10, right: 12, backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  popularText: { fontSize: 9, fontWeight: '800', color: '#000' },
  packages: { gap: 10, marginBottom: 20 },
  packageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 1.5 },
  pkgName: { fontSize: 15, fontWeight: '700' },
  pkgSave: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  pkgPrice: { fontSize: 18, fontWeight: '800' },
  pkgPer: { fontSize: 12 },
  cta: { width: '100%', marginBottom: 14 },
  restore: { textAlign: 'center', fontSize: 14, marginBottom: 10 },
  terms: { textAlign: 'center', fontSize: 11 },
});
