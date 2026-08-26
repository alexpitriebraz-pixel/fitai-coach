import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeView } from '../../components/common/SafeView';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';
import { EXERCISES } from '../../constants/exercises';

export function ExerciseDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const exercise = EXERCISES.find((e) => e.id === route.params?.exerciseId);

  if (!exercise) {
    return (
      <SafeView>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Exercise not found</Text>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconBox, { backgroundColor: `${colors.accent}20` }]}>
          <Text style={styles.icon}>🏋️</Text>
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{exercise.name}</Text>

        <View style={styles.badges}>
          <Badge label={exercise.category} color={colors.accent} />
          <Badge label={exercise.difficulty} color={colors.textSecondary} />
        </View>

        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Muscles Worked</Text>
          <View style={styles.muscleRow}>
            {exercise.muscleGroups.map((m) => (
              <View key={m} style={[styles.muscleChip, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.muscleText, { color: colors.text }]}>{m.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Do It</Text>
          {exercise.instructions.map((inst, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: colors.accent }]}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>{inst}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipment Needed</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            {exercise.equipment.map((e) => e.replace('_', ' ')).join(', ')}
          </Text>
        </Card>
      </ScrollView>
    </SafeView>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[badgeStyles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  text: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, gap: 16, paddingBottom: 32 },
  iconBox: { alignSelf: 'center', padding: 24, borderRadius: 40, marginBottom: 8 },
  icon: { fontSize: 48 },
  name: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muscleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  muscleText: { fontSize: 13, textTransform: 'capitalize' },
  step: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  bodyText: { fontSize: 14, textTransform: 'capitalize' },
});
