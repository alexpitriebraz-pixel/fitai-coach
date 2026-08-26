import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { EXERCISES } from '../../constants/exercises';
import type { RootStackParamList } from '../../types/navigation';

type Tab = 'plans' | 'library';
type Category = 'all' | 'strength' | 'cardio' | 'flexibility' | 'bodyweight';

export function WorkoutsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { plans } = useWorkoutStore();
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const [category, setCategory] = useState<Category>('all');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const filteredExercises = EXERCISES.filter(
    (e) => category === 'all' || e.category === category,
  );

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t('workouts.allCategories') },
    { key: 'strength', label: t('workouts.strength') },
    { key: 'cardio', label: t('workouts.cardio') },
    { key: 'bodyweight', label: t('workouts.bodyweight') },
    { key: 'flexibility', label: t('workouts.flexibility') },
  ];

  return (
    <SafeView edges={['top']}>
      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['plans', 'library'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, { color: activeTab === tab ? colors.accent : colors.textSecondary }]}>
              {tab === 'plans' ? t('workouts.myPlans') : t('workouts.exerciseLibrary')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'plans' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Button
            title={t('workouts.generatePlan')}
            onPress={() => {}}
            style={styles.generateBtn}
          />
          {plans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('workouts.noPlans')}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>{t('workouts.createFirst')}</Text>
            </View>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                  {plan.isAiGenerated && (
                    <View style={[styles.aiBadge, { backgroundColor: `${colors.accent}20` }]}>
                      <Text style={[styles.aiBadgeText, { color: colors.accent }]}>AI</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.planDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {plan.description}
                </Text>
                <Text style={[styles.planMeta, { color: colors.textMuted }]}>
                  {t('workouts.exercises', { count: plan.exercises.length })} · {t('workouts.estimated', { minutes: plan.estimatedDuration })}
                </Text>
                <Button
                  title={t('workouts.startWorkout')}
                  onPress={() => {}}
                  size="sm"
                  style={styles.startBtn}
                />
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        <>
          {/* Category filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: category === key ? colors.accent : colors.surface,
                    borderColor: category === key ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setCategory(key)}
              >
                <Text style={[styles.categoryLabel, { color: category === key ? '#fff' : colors.text }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredExercises}
            keyExtractor={(e) => e.id}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.exerciseRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]}>
                    {item.muscleGroups.slice(0, 2).join(', ')} · {item.difficulty}
                  </Text>
                </View>
                <Text style={{ color: colors.textMuted }}>›</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeView>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabLabel: { fontSize: 15, fontWeight: '600' },
  content: { padding: 16, gap: 12 },
  generateBtn: { width: '100%', marginBottom: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
  planCard: { gap: 8 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 17, fontWeight: '700', flex: 1 },
  aiBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  aiBadgeText: { fontSize: 11, fontWeight: '800' },
  planDesc: { fontSize: 13 },
  planMeta: { fontSize: 12 },
  startBtn: {},
  categoryScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryLabel: { fontSize: 13, fontWeight: '600' },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '600' },
  exerciseMeta: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
});
