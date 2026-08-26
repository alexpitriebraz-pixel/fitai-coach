import React, { useState } from 'react';
import { FlatList, TextInput, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { useTheme } from '../../hooks/useTheme';
import { EXERCISES } from '../../constants/exercises';
import type { WorkoutStackParamList } from '../../types/navigation';

export function ExerciseLibraryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const [search, setSearch] = useState('');

  const filtered = EXERCISES.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroups.some((m) => m.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <SafeView edges={['bottom']}>
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises or muscles..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
            activeOpacity={0.8}
          >
            <View style={[styles.categoryDot, { backgroundColor: categoryColor(item.category, colors) }]} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {item.muscleGroups.slice(0, 3).join(' · ')} · {item.difficulty}
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>No exercises found</Text>
        }
      />
    </SafeView>
  );
}

function categoryColor(cat: string, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (cat) {
    case 'strength': return colors.accent;
    case 'cardio': return colors.success;
    case 'flexibility': return '#8B5CF6';
    default: return colors.accentLight;
  }
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});
