import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeView } from '../../components/common/SafeView';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';
import { useWorkoutStore } from '../../store/useWorkoutStore';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 120;

type Period = 'weekly' | 'monthly' | 'allTime';

function SimpleBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
      {data.map((val, i) => (
        <View key={i} style={styles.barWrapper}>
          <View
            style={[
              styles.bar,
              {
                height: (val / max) * CHART_HEIGHT,
                backgroundColor: val > 0 ? color : 'rgba(128,128,128,0.15)',
                borderRadius: 4,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export function ProgressScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { logs, getStreak } = useWorkoutStore();
  const [period, setPeriod] = useState<Period>('weekly');

  const streak = getStreak();
  const totalWorkouts = logs.filter((l) => l.completedAt).length;

  // Build weekly bar data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return logs.filter((l) => l.completedAt?.startsWith(dateStr)).length;
  });

  // Build monthly data (last 4 weeks aggregated)
  const monthlyData = Array.from({ length: 4 }, (_, week) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - week * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    return logs.filter((l) => {
      if (!l.completedAt) return false;
      const d = new Date(l.completedAt);
      return d >= weekStart && d <= weekEnd;
    }).length;
  }).reverse();

  const chartData = period === 'weekly' ? weeklyData : monthlyData;
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekLabels = ['W1', 'W2', 'W3', 'W4'];

  const periods: { key: Period; label: string }[] = [
    { key: 'weekly', label: t('progress.weekly') },
    { key: 'monthly', label: t('progress.monthly') },
  ];

  return (
    <SafeView edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t('progress.title')}</Text>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statNum, { color: colors.accent }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('progress.streak')}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>💪</Text>
            <Text style={[styles.statNum, { color: colors.accent }]}>{totalWorkouts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('progress.totalWorkouts')}
            </Text>
          </Card>
        </View>

        {/* Workout frequency chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>{t('workouts.workoutsCompleted')}</Text>
            <View style={styles.periodRow}>
              {periods.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.periodBtn,
                    {
                      backgroundColor: period === key ? colors.accent : 'transparent',
                    },
                  ]}
                  onPress={() => setPeriod(key)}
                >
                  <Text style={[styles.periodLabel, { color: period === key ? '#fff' : colors.textSecondary }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {logs.length === 0 ? (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>{t('progress.noData')}</Text>
          ) : (
            <>
              <SimpleBarChart data={chartData} color={colors.accent} />
              <View style={styles.labels}>
                {(period === 'weekly' ? dayLabels : weekLabels).map((l, i) => (
                  <Text key={i} style={[styles.label, { color: colors.textMuted }]}>{l}</Text>
                ))}
              </View>
            </>
          )}
        </Card>

        {/* Recent workouts list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Workouts</Text>
          {logs.slice(0, 5).map((log) => (
            <Card key={log.id} style={styles.logCard}>
              <View style={styles.logRow}>
                <View>
                  <Text style={[styles.logName, { color: colors.text }]}>{log.planName}</Text>
                  <Text style={[styles.logDate, { color: colors.textSecondary }]}>
                    {log.completedAt ? new Date(log.completedAt).toLocaleDateString() : 'In progress'}
                  </Text>
                </View>
                <View style={styles.logStats}>
                  <Text style={[styles.logDuration, { color: colors.accent }]}>
                    {log.durationMinutes ?? 0}m
                  </Text>
                </View>
              </View>
            </Card>
          ))}
          {logs.length === 0 && (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>{t('progress.noData')}</Text>
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  title: { fontSize: 26, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: 16 },
  statEmoji: { fontSize: 28 },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, textAlign: 'center' },
  chartCard: { gap: 16 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { fontSize: 15, fontWeight: '700' },
  periodRow: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden' },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  periodLabel: { fontSize: 12, fontWeight: '600' },
  chart: { flexDirection: 'row', alignItems: 'flex-end' },
  barWrapper: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%' },
  labels: { flexDirection: 'row' },
  label: { flex: 1, textAlign: 'center', fontSize: 11 },
  noData: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  logCard: {},
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logName: { fontSize: 15, fontWeight: '600' },
  logDate: { fontSize: 12, marginTop: 2 },
  logStats: {},
  logDuration: { fontSize: 16, fontWeight: '700' },
});
