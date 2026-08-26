import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { nanoid } from '../../utils/nanoid';
import type { ExperienceLevel } from '../../types';
import type { OnboardingScreenProps } from '../../types/navigation';

const levels: { type: ExperienceLevel; key: string; descKey: string }[] = [
  { type: 'beginner', key: 'beginner', descKey: 'beginnerDesc' },
  { type: 'intermediate', key: 'intermediate', descKey: 'intermediateDesc' },
  { type: 'advanced', key: 'advanced', descKey: 'advancedDesc' },
];

export function ProfileScreen({ navigation }: OnboardingScreenProps<'Profile'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { profile, setProfile, updateProfile } = useAppStore();

  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile?.age?.toString() ?? '');
  const [level, setLevel] = useState<ExperienceLevel>(profile?.experienceLevel ?? 'beginner');
  const [days, setDays] = useState(profile?.daysPerWeek ?? 3);

  const handleContinue = async () => {
    const parsedAge = parseInt(age, 10);
    if (!name.trim() || !parsedAge) return;

    if (profile) {
      await updateProfile({ name: name.trim(), age: parsedAge, experienceLevel: level, daysPerWeek: days });
    } else {
      await setProfile({
        id: nanoid(),
        name: name.trim(),
        age: parsedAge,
        goal: 'general_health',
        experienceLevel: level,
        equipment: ['none'],
        daysPerWeek: days,
        unitSystem: 'metric',
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      });
    }
    navigation.navigate('Equipment');
  };

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.profile.title')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('onboarding.profile.name')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Alex"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('onboarding.profile.age')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={age}
              onChangeText={setAge}
              placeholder="25"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('onboarding.profile.experienceLevel')}</Text>
            <View style={styles.levelRow}>
              {levels.map(({ type, key, descKey }) => {
                const isSelected = level === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.levelOption,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setLevel(type)}
                  >
                    <Text style={[styles.levelTitle, { color: isSelected ? '#fff' : colors.text }]}>
                      {t(`onboarding.profile.${key}`)}
                    </Text>
                    <Text style={[styles.levelDesc, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textMuted }]}>
                      {t(`onboarding.profile.${descKey}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('onboarding.profile.daysPerWeek')}
            </Text>
            <View style={styles.daysRow}>
              {[2, 3, 4, 5, 6].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dayBtn,
                    {
                      backgroundColor: days === d ? colors.accent : colors.surface,
                      borderColor: days === d ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setDays(d)}
                >
                  <Text style={{ color: days === d ? '#fff' : colors.text, fontWeight: '700' }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          disabled={!name.trim() || !age}
          size="lg"
          style={styles.button}
        />
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  header: { paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  form: { gap: 24, marginBottom: 32 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  levelRow: { gap: 8 },
  levelOption: { padding: 14, borderRadius: 12, borderWidth: 1.5 },
  levelTitle: { fontSize: 15, fontWeight: '700' },
  levelDesc: { fontSize: 12, marginTop: 2 },
  daysRow: { flexDirection: 'row', gap: 10 },
  dayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  button: { width: '100%' },
});
