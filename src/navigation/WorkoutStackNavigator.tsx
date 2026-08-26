import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../hooks/useTheme';
import { WorkoutDetailScreen } from '../screens/workout/WorkoutDetailScreen';
import { ActiveWorkoutScreen } from '../screens/workout/ActiveWorkoutScreen';
import { ExerciseLibraryScreen } from '../screens/workout/ExerciseLibraryScreen';
import { ExerciseDetailScreen } from '../screens/workout/ExerciseDetailScreen';
import { RestTimerScreen } from '../screens/workout/RestTimerScreen';
import type { WorkoutStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export function WorkoutStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="WorkoutDetail"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Workout' }} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ title: 'Active Workout', headerShown: false }} />
      <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{ title: 'Exercise Library' }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
      <Stack.Screen name="RestTimer" component={RestTimerScreen} options={{ title: 'Rest Timer', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
