import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import type { WorkoutStackParamList } from '../../types/navigation';

export function ActiveWorkoutScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const { activeLog, updateSet, finishWorkout, cancelWorkout } = useWorkoutStore();
  const [currentExIdx, setCurrentExIdx] = useState(0);

  if (!activeLog) {
    navigation.goBack();
    return null;
  }

  const currentEx = activeLog.exercises[currentExIdx];
  const isLast = currentExIdx === activeLog.exercises.length - 1;

  const handleFinish = async () => {
    Alert.alert('Finish Workout?', 'Great job! Log this workout?', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          await finishWorkout();
          navigation.popToTop();
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Workout?', 'Progress will not be saved.', [
      { text: 'Continue', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <SafeView edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={[styles.cancelBtn, { color: colors.error }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{activeLog.planName}</Text>
        <Text style={[styles.progress, { color: colors.textSecondary }]}>
          {currentExIdx + 1}/{activeLog.exercises.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise name */}
        <Text style={[styles.exName, { color: colors.text }]}>{currentEx.exercise.name}</Text>
        <Text style={[styles.muscles, { color: colors.textSecondary }]}>
          {currentEx.exercise.muscleGroups.slice(0, 3).join(' · ')}
        </Text>

        {/* Instructions */}
        <View style={[styles.instructionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {currentEx.exercise.instructions.slice(0, 2).map((inst, i) => (
            <Text key={i} style={[styles.instruction, { color: colors.textSecondary }]}>
              {i + 1}. {inst}
            </Text>
          ))}
        </View>

        {/* Sets */}
        <Text style={[styles.setsTitle, { color: colors.text }]}>Sets</Text>
        <View style={[styles.setHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.setHeaderLabel, { color: colors.textMuted, flex: 1 }]}>Set</Text>
          <Text style={[styles.setHeaderLabel, { color: colors.textMuted, width: 80 }]}>Reps</Text>
          <Text style={[styles.setHeaderLabel, { color: colors.textMuted, width: 80 }]}>Weight</Text>
          <Text style={[styles.setHeaderLabel, { color: colors.textMuted, width: 44 }]}>Done</Text>
        </View>

        {currentEx.sets.map((set, setIdx) => (
          <View key={set.id} style={[styles.setRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.setNum, { color: colors.textSecondary, flex: 1 }]}>{setIdx + 1}</Text>
            <TextInput
              style={[styles.setInput, { color: colors.text, backgroundColor: colors.surfaceElevated, width: 80 }]}
              value={set.reps?.toString() ?? ''}
              onChangeText={(v) => updateSet(currentExIdx, setIdx, { reps: parseInt(v, 10) || undefined })}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.setInput, { color: colors.text, backgroundColor: colors.surfaceElevated, width: 80 }]}
              value={set.weight?.toString() ?? ''}
              onChangeText={(v) => updateSet(currentExIdx, setIdx, { weight: parseFloat(v) || undefined })}
              keyboardType="decimal-pad"
              placeholder="—"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: set.completed ? colors.success : colors.surfaceElevated, width: 44 }]}
              onPress={() => updateSet(currentExIdx, setIdx, { completed: !set.completed })}
            >
              <Text style={{ color: set.completed ? '#fff' : colors.textMuted, fontWeight: '700' }}>✓</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Rest timer shortcut */}
        <TouchableOpacity
          style={[styles.restBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('RestTimer', { seconds: 90 })}
        >
          <Text style={styles.restIcon}>⏱</Text>
          <Text style={[styles.restLabel, { color: colors.text }]}>Start Rest Timer (90s)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer navigation */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.prevBtn, { borderColor: colors.border }]}
          onPress={() => setCurrentExIdx((i) => Math.max(0, i - 1))}
          disabled={currentExIdx === 0}
        >
          <Text style={[styles.navBtnText, { color: currentExIdx === 0 ? colors.textMuted : colors.text }]}>‹ Prev</Text>
        </TouchableOpacity>

        {isLast ? (
          <Button title="Finish Workout 💪" onPress={handleFinish} style={styles.nextBtn} />
        ) : (
          <Button
            title="Next Exercise ›"
            onPress={() => setCurrentExIdx((i) => i + 1)}
            style={styles.nextBtn}
          />
        )}
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cancelBtn: { fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  progress: { fontSize: 14 },
  content: { padding: 20, gap: 16, paddingBottom: 100 },
  exName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  muscles: { fontSize: 14, textTransform: 'capitalize' },
  instructionBox: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  instruction: { fontSize: 14, lineHeight: 20 },
  setsTitle: { fontSize: 17, fontWeight: '700' },
  setHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1 },
  setHeaderLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
  setNum: { fontSize: 15, textAlign: 'center' },
  setInput: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 15, textAlign: 'center' },
  doneBtn: { height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  restBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  restIcon: { fontSize: 20 },
  restLabel: { fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1 },
  prevBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 15, fontWeight: '600' },
  nextBtn: { flex: 1 },
});
