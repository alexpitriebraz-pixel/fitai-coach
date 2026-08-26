import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  initialSeconds: number;
  onComplete?: () => void;
}

export function RestTimer({ initialSeconds, onComplete }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            onComplete?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setSeconds(initialSeconds);
    setRunning(true);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  const progress = seconds / initialSeconds;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Text style={[styles.time, { color: seconds === 0 ? colors.success : colors.text }]}>
          {display}
        </Text>
        {seconds === 0 && (
          <Text style={[styles.ready, { color: colors.success }]}>Ready!</Text>
        )}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggle}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>{running ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.accent }]}
          onPress={reset}
        >
          <Text style={[styles.btnText, { color: '#fff' }]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  ring: { alignItems: 'center', justifyContent: 'center', width: 140, height: 140 },
  time: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  ready: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  controls: { flexDirection: 'row', gap: 12 },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnText: { fontWeight: '700', fontSize: 15 },
});
