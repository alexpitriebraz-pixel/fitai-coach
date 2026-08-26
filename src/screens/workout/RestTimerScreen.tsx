import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeView } from '../../components/common/SafeView';
import { RestTimer } from '../../components/workout/RestTimer';
import { useTheme } from '../../hooks/useTheme';

export function RestTimerScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const seconds = route.params?.seconds ?? 90;

  return (
    <SafeView>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Rest Timer</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Take a breather. You earned it!
        </Text>
        <RestTimer initialSeconds={seconds} onComplete={() => {}} />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 15 },
});
