import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import type { WorkoutStackParamList } from '../../types/navigation';

export function WorkoutDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const route = useRoute<any>();
  const { plans, startWorkout } = useWorkoutStore();

  const plan = plans.find((p) => p.id === route.params?.planId);

  if (!plan) {
    return (
      <SafeView>
        <View style={styles.center}>
          <Text style={[styles.error, { color: colors.textSecondary }]}>Workout not found</Text>
        </View>
      </SafeView>
    );
  }

  const handleStart = () => {
    startWorkout(plan);
    navigation.navigate('ActiveWorkout', { planId: plan.id });
  };

  return (
    <SafeView edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.name, { color: colors.text }]}>{plan.name}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{plan.description}</Text>

        <View style={styles.meta}>
          <View style={[styles.metaBadge, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.metaText, { color: colors.text }]}>⏱ ~{plan.estimatedDuration} min</Text>
          </View>
          <View style={[styles.metaBadge, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.metaText, { color: colors.text }]}>💪 {plan.difficulty}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercises</Text>

        {plan.exercises.map((ex, idx) => (
          <Card key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={[styles.indexBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.indexText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.exerciseName, { color: colors.text }]}>{ex.exercise.name}</Text>
            </View>
            <Text style={[styles.sets, { color: colors.textSecondary }]}>
              {ex.sets.length} sets × {ex.sets[0]?.reps ? `${ex.sets[0].reps} reps` : `${ex.sets[0]?.duration}s`}
            </Text>
            {ex.exercise.muscleGroups.length > 0 && (
              <Text style={[styles.muscles, { color: colors.textMuted }]}>
                {ex.exercise.muscleGroups.slice(0, 3).join(' · ')}
              </Text>
            )}
          </Card>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Button title="Start Workout" onPress={handleStart} size="lg" style={styles.startBtn} />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 16 },
  container: { padding: 20, paddingBottom: 100, gap: 16 },
  name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  desc: { fontSize: 15, lineHeight: 22 },
  meta: { flexDirection: 'row', gap: 8 },
  metaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  metaText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  exerciseCard: { gap: 6 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  indexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  indexText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  exerciseName: { fontSize: 16, fontWeight: '700', flex: 1 },
  sets: { fontSize: 14 },
  muscles: { fontSize: 12, textTransform: 'capitalize' },
  footer: { padding: 16, borderTopWidth: 1 },
  startBtn: { width: '100%' },
});
