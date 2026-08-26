import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Goal: undefined;
  Profile: undefined;
  Equipment: undefined;
  HealthDisclaimer: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Coach: undefined;
  Workouts: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type WorkoutStackParamList = {
  WorkoutDetail: { planId: string };
  ActiveWorkout: { planId: string };
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
  RestTimer: { seconds: number };
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Paywall: { trigger: 'message_limit' | 'feature' };
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataDeletion: undefined;
};

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = NativeStackScreenProps<OnboardingStackParamList, T>;
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;
export type WorkoutScreenProps<T extends keyof WorkoutStackParamList> = NativeStackScreenProps<WorkoutStackParamList, T>;
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
