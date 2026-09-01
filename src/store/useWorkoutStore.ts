import { create } from 'zustand';
import { api } from '../services/api';
import { nanoid } from '../utils/nanoid';
import type { WorkoutPlan, WorkoutLog, WorkoutExercise, WorkoutSet } from '../types';

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
    try {
      const plan = await api.createPlan(planData);
      set((s) => ({ plans: [plan, ...s.plans] }));
      return plan;
    } catch {
      // Offline fallback — use local ID
      const plan: WorkoutPlan = { ...planData, id: nanoid(), createdAt: new Date().toISOString() };
      set((s) => ({ plans: [plan, ...s.plans] }));
      return plan;
    }
  },

  removePlan: async (planId) => {
    set((s) => ({ plans: s.plans.filter((p) => p.id !== planId) }));
    api.deletePlan(planId).catch(() => {});
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

    const completedAt = new Date().toISOString();
    const durationMinutes = Math.round(
      (new Date(completedAt).getTime() - new Date(log.startedAt).getTime()) / 60000,
    );
    const finishedLog: WorkoutLog = { ...log, completedAt, durationMinutes };

    set((s) => ({ logs: [finishedLog, ...s.logs], activeLog: null, activePlanId: null }));
    api.createLog(finishedLog).catch(() => {});
    return finishedLog;
  },

  cancelWorkout: () => set({ activeLog: null, activePlanId: null }),

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
      if (diffDays === 0 || diffDays === 1) { streak++; current = date; }
      else break;
    }
    return streak;
  },

  getWeeklyCount: () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return get().logs.filter((l) => l.completedAt && new Date(l.completedAt) >= weekStart).length;
  },

  hydrate: async () => {
    try {
      const [plans, logs] = await Promise.all([api.getPlans(), api.getLogs()]);
      set({ plans, logs, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
