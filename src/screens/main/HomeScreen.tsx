import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import type { RootStackParamList } from '../../types/navigation';

export function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const profile = useAppStore((s) => s.profile);
  const { plans, logs, getStreak, getWeeklyCount } = useWorkoutStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const streak = getStreak();
  const weeklyCount = getWeeklyCount();
  const todayPlan = plans[0] ?? null;
  const recentLogs = logs.slice(0, 3);

  const greeting = profile?.name
    ? t('home.greeting', { name: profile.name })
    : t('home.greetingDefault');

  return (
    <SafeView edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              {streak > 0 ? t('home.streak', { count: streak }) : "Let's get moving!"}
            </Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: `${colors.accent}20` }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakNum, { color: colors.accent }]}>{streak}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{weeklyCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This week</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{logs.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{profile?.daysPerWeek ?? 3}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goal/week</Text>
            </Card>
          </View>

          {/* Today's Plan */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.todaysPlan')}</Text>
            {todayPlan ? (
              <Card>
                <Text style={[styles.planName, { color: colors.text }]}>{todayPlan.name}</Text>
                <Text style={[styles.planMeta, { color: colors.textSecondary }]}>
                  {todayPlan.exercises.length} exercises · ~{todayPlan.estimatedDuration} min
                </Text>
                <Button
                  title={t('workouts.startWorkout')}
                  onPress={() => {}}
                  style={styles.startBtn}
                />
              </Card>
            ) : (
              <Card>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('home.noWorkout')}</Text>
                <Button
                  title={t('home.askCoach')}
                  onPress={() => {}}
                  variant="outline"
                  style={styles.startBtn}
                />
              </Card>
            )}
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.recentActivity')}</Text>
            {recentLogs.length === 0 ? (
              <Card>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('home.noActivity')}</Text>
              </Card>
            ) : (
              recentLogs.map((log) => (
                <Card key={log.id} style={styles.logCard}>
                  <Text style={[styles.logName, { color: colors.text }]}>{log.planName}</Text>
                  <Text style={[styles.logMeta, { color: colors.textSecondary }]}>
                    {log.completedAt ? new Date(log.completedAt).toLocaleDateString() : 'In progress'} · {log.durationMinutes ?? 0} min
                  </Text>
                </Card>
              ))
            )}
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.quickStart')}</Text>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {}}
              >
                <Text style={styles.quickIcon}>🤖</Text>
                <Text style={[styles.quickLabel, { color: colors.text }]}>{t('home.askCoach')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {}}
              >
                <Text style={styles.quickIcon}>📚</Text>
                <Text style={[styles.quickLabel, { color: colors.text }]}>Exercises</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 22, fontWeight: '800' },
  subGreeting: { fontSize: 14, marginTop: 2 },
  streakBadge: { padding: 10, borderRadius: 12, alignItems: 'center' },
  streakEmoji: { fontSize: 20 },
  streakNum: { fontSize: 16, fontWeight: '800' },
  content: { padding: 20, gap: 0 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  planName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  planMeta: { fontSize: 13, marginBottom: 14 },
  startBtn: { width: '100%' },
  emptyText: { fontSize: 14, marginBottom: 12 },
  logCard: { marginBottom: 8 },
  logName: { fontSize: 15, fontWeight: '600' },
  logMeta: { fontSize: 12, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
