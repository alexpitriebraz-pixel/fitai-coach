import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from '../utils/nanoid';
import type { WorkoutPlan, WorkoutLog, WorkoutExercise, WorkoutSet } from '../types';

const PLANS_KEY = '@fitai:plans';
const LOGS_KEY = '@fitai:logs';

interface WorkoutState {
  plans: WorkoutPlan[];
  logs: WorkoutLog[];
  activePlanId: string | null;
  activeLog: WorkoutLog | null;
  hydrated: boolean;

  addPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => Promise<WorkoutPlan>;
  removePlan: (planId: string) => Promise<void>;
  startWorkout: (plan: WorkoutPlan) => void;
  updateSet: (exerciseIdx: number, setIdx: number, data: Partial<WorkoutSet>) => void;
  finishWorkout: () => Promise<WorkoutLog | null>;
  cancelWorkout: () => void;
  getStreak: () => number;
  getWeeklyCount: () => number;
  hydrate: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plans: [],
  logs: [],
  activePlanId: null,
  activeLog: null,
  hydrated: false,

  addPlan: async (planData) => {
    const plan: WorkoutPlan = {
      ...planData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    const plans = [plan, ...get().plans];
    set({ plans });
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    return plan;
  },

  removePlan: async (planId) => {
    const plans = get().plans.filter((p) => p.id !== planId);
    set({ plans });
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  startWorkout: (plan) => {
    const activeLog: WorkoutLog = {
      id: nanoid(),
      planId: plan.id,
      planName: plan.name,
      exercises: plan.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s, completed: false })),
      })),
      startedAt: new Date().toISOString(),
    };
    set({ activeLog, activePlanId: plan.id });
  },

  updateSet: (exerciseIdx, setIdx, data) => {
    const log = get().activeLog;
    if (!log) return;
    const exercises = [...log.exercises];
    const sets = [...exercises[exerciseIdx].sets];
    sets[setIdx] = { ...sets[setIdx], ...data };
    exercises[exerciseIdx] = { ...exercises[exerciseIdx], sets };
    set({ activeLog: { ...log, exercises } });
  },

  finishWorkout: async () => {
    const log = get().activeLog;
    if (!log) return null;

    const startedAt = new Date(log.startedAt);
    const completedAt = new Date();
    const durationMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);

    const finishedLog: WorkoutLog = {
      ...log,
      completedAt: completedAt.toISOString(),
      durationMinutes,
    };

    const logs = [finishedLog, ...get().logs];
    set({ logs, activeLog: null, activePlanId: null });
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return finishedLog;
  },

  cancelWorkout: () => {
    set({ activeLog: null, activePlanId: null });
  },

  getStreak: () => {
    const logs = get().logs.filter((l) => l.completedAt);
    if (logs.length === 0) return 0;

    const dates = [...new Set(logs.map((l) => l.completedAt!.split('T')[0]))].sort().reverse();
    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const diffDays = Math.round((current.getTime() - date.getTime()) / 86400000);
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        current = date;
      } else {
        break;
      }
    }
    return streak;
  },

  getWeeklyCount: () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return get().logs.filter((l) => {
      if (!l.completedAt) return false;
      return new Date(l.completedAt) >= weekStart;
    }).length;
  },

  hydrate: async () => {
    try {
      const [rawPlans, rawLogs] = await Promise.all([
        AsyncStorage.getItem(PLANS_KEY),
        AsyncStorage.getItem(LOGS_KEY),
      ]);
      set({
        plans: rawPlans ? JSON.parse(rawPlans) : [],
        logs: rawLogs ? JSON.parse(rawLogs) : [],
        hydrated: true,
      });
    } catch (_) {
      set({ hydrated: true });
    }
  },
}));
