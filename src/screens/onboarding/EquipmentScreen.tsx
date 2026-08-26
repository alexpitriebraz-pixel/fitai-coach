import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import type { EquipmentType } from '../../types';
import type { OnboardingScreenProps } from '../../types/navigation';

const equipmentOptions: { type: EquipmentType; icon: string; key: string; descKey: string }[] = [
  { type: 'none', icon: '🧘', key: 'none', descKey: 'noneDesc' },
  { type: 'dumbbells', icon: '🏋️', key: 'dumbbells', descKey: 'dumbbellsDesc' },
  { type: 'barbell', icon: '🔩', key: 'barbell', descKey: 'barbellDesc' },
  { type: 'resistance_bands', icon: '🪢', key: 'resistanceBands', descKey: 'resistanceBandsDesc' },
  { type: 'full_gym', icon: '🏢', key: 'fullGym', descKey: 'fullGymDesc' },
];

export function EquipmentScreen({ navigation }: OnboardingScreenProps<'Equipment'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { profile, updateProfile } = useAppStore();
  const [selected, setSelected] = useState<EquipmentType[]>(profile?.equipment ?? ['none']);

  const toggle = (type: EquipmentType) => {
    setSelected((prev) => {
      if (type === 'none') return ['none'];
      const withoutNone = prev.filter((e) => e !== 'none');
      if (withoutNone.includes(type)) {
        const result = withoutNone.filter((e) => e !== type);
        return result.length === 0 ? ['none'] : result;
      }
      return [...withoutNone, type];
    });
  };

  const handleContinue = async () => {
    await updateProfile({ equipment: selected });
    navigation.navigate('HealthDisclaimer');
  };

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.equipment.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.equipment.subtitle')}</Text>
        </View>

        <View style={styles.options}>
          {equipmentOptions.map(({ type, icon, key, descKey }) => {
            const isSelected = selected.includes(type);
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? `${colors.accent}20` : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => toggle(type)}
                activeOpacity={0.8}
              >
                <Text style={styles.icon}>{icon}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {t(`onboarding.equipment.${key}`)}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    {t(`onboarding.equipment.${descKey}`)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isSelected ? colors.accent : 'transparent',
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          size="lg"
          style={styles.button}
        />
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  header: { paddingTop: 32, paddingBottom: 24, gap: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 16 },
  options: { gap: 12, marginBottom: 32 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  icon: { fontSize: 28 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 13, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  button: { width: '100%' },
});
