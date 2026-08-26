export type GoalType = 'lose_weight' | 'build_muscle' | 'endurance' | 'general_health';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType = 'none' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'full_gym';
export type UnitSystem = 'metric' | 'imperial';
export type Theme = 'dark' | 'light';
export type Language = 'en' | 'pt-BR' | 'es';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  equipment: EquipmentType[];
  daysPerWeek: number;
  unitSystem: UnitSystem;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  unitSystem: UnitSystem;
  notificationsEnabled: boolean;
  workoutReminderTime: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Exercise {
  id: string;
  name: string;
  nameKey?: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'bodyweight';
  muscleGroups: string[];
  equipment: EquipmentType[];
  instructions: string[];
  difficulty: ExperienceLevel;
  imageUrl?: string;
}

export interface WorkoutSet {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
  difficulty: ExperienceLevel;
  targetMuscles: string[];
  createdAt: string;
  isAiGenerated: boolean;
}

export interface WorkoutLog {
  id: string;
  planId: string;
  planName: string;
  exercises: WorkoutExercise[];
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  notes?: string;
}

export interface ProgressData {
  date: string;
  value: number;
  label?: string;
}

export interface SubscriptionInfo {
  isPremium: boolean;
  entitlements: string[];
  dailyMessagesUsed: number;
  dailyMessageLimit: number;
  currentOffering: any | null;
}
