import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import type { GoalType } from '../../types';
import type { OnboardingScreenProps } from '../../types/navigation';

const goals: { type: GoalType; icon: string; key: string; descKey: string }[] = [
  { type: 'lose_weight', icon: '🔥', key: 'loseWeight', descKey: 'loseWeightDesc' },
  { type: 'build_muscle', icon: '💪', key: 'buildMuscle', descKey: 'buildMuscleDesc' },
  { type: 'endurance', icon: '🏃', key: 'endurance', descKey: 'enduranceDesc' },
  { type: 'general_health', icon: '❤️', key: 'generalHealth', descKey: 'generalHealthDesc' },
];

export function GoalScreen({ navigation }: OnboardingScreenProps<'Goal'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const profile = useAppStore((s) => s.profile);
  const [selected, setSelected] = useState<GoalType | null>(profile?.goal ?? null);

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ goal: selected });
    navigation.navigate('Profile');
  };

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.goal.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.goal.subtitle')}</Text>
        </View>

        <View style={styles.options}>
          {goals.map(({ type, icon, key, descKey }) => {
            const isSelected = selected === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setSelected(type)}
                activeOpacity={0.8}
              >
                <Text style={styles.icon}>{icon}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: isSelected ? '#fff' : colors.text }]}>
                    {t(`onboarding.goal.${key}`)}
                  </Text>
                  <Text style={[styles.optionDesc, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                    {t(`onboarding.goal.${descKey}`)}
                  </Text>
                </View>
                {isSelected && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          disabled={!selected}
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
  optionTitle: { fontSize: 17, fontWeight: '700' },
  optionDesc: { fontSize: 13, marginTop: 2 },
  check: { fontSize: 18, color: '#fff', fontWeight: '700' },
  button: { width: '100%' },
});
