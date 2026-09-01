import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from '../utils/nanoid';
import type { UserProfile, WorkoutPlan, WorkoutLog, ChatMessage } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://167.233.153.241:3000';
const DEVICE_KEY = '@fitai:device_id';

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = nanoid();
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

async function authHeaders(): Promise<Record<string, string>> {
  return { 'Content-Type': 'application/json', 'x-device-id': await getDeviceId() };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}`);
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error(`DELETE ${path} → ${res.status}`);
}

// --- Mappers ---

function toBackendProfile(profile: Partial<UserProfile>): Record<string, unknown> {
  return {
    name: profile.name,
    age: profile.age,
    goal: profile.goal,
    experience_level: profile.experienceLevel,
    equipment: profile.equipment,
    days_per_week: profile.daysPerWeek,
    unit_system: profile.unitSystem,
    settings: { onboardingComplete: profile.onboardingComplete },
  };
}

function fromBackendProfile(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name ?? '',
    age: row.age ?? 0,
    goal: row.goal ?? 'general_health',
    experienceLevel: row.experience_level ?? 'beginner',
    equipment: row.equipment ?? [],
    daysPerWeek: row.days_per_week ?? 3,
    unitSystem: row.unit_system ?? 'metric',
    onboardingComplete: row.settings?.onboardingComplete ?? false,
    createdAt: row.created_at,
  };
}

function toBackendPlan(plan: Omit<WorkoutPlan, 'id' | 'createdAt'>): Record<string, unknown> {
  return {
    name: plan.name,
    description: plan.description,
    exercises: plan.exercises,
    estimated_duration: plan.estimatedDuration,
    difficulty: plan.difficulty,
    is_ai_generated: plan.isAiGenerated,
  };
}

function fromBackendPlan(row: any): WorkoutPlan {
  const exercises: any[] = Array.isArray(row.exercises) ? row.exercises : [];
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    exercises,
    estimatedDuration: row.estimated_duration ?? 0,
    difficulty: row.difficulty ?? 'beginner',
    targetMuscles: [...new Set<string>(exercises.flatMap((e) => e.exercise?.muscleGroups ?? []))],
    createdAt: row.created_at,
    isAiGenerated: row.is_ai_generated ?? false,
  };
}

function toBackendLog(log: WorkoutLog): Record<string, unknown> {
  return {
    plan_id: log.planId || null,
    plan_name: log.planName,
    exercises: log.exercises,
    started_at: log.startedAt,
    completed_at: log.completedAt ?? null,
    duration_minutes: log.durationMinutes ?? null,
    notes: log.notes ?? null,
  };
}

function fromBackendLog(row: any): WorkoutLog {
  return {
    id: row.id,
    planId: row.plan_id ?? '',
    planName: row.plan_name ?? '',
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// --- API ---

export const api = {
  getProfile: () => get<any>('/users/me').then(fromBackendProfile),

  updateProfile: (profile: Partial<UserProfile>) =>
    put<any>('/users/me', toBackendProfile(profile)).then(fromBackendProfile),

  deleteAccount: () => del('/users/me'),

  streamChat: (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    onChunk: (chunk: string) => void,
  ): Promise<void> =>
    new Promise(async (resolve, reject) => {
      const deviceId = await getDeviceId();
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/coach/chat`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-device-id', deviceId);

      let offset = 0;
      xhr.onprogress = () => {
        const newData = xhr.responseText.slice(offset);
        offset = xhr.responseText.length;
        for (const line of newData.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) { reject(new Error(parsed.error)); return; }
            if (parsed.text) onChunk(parsed.text);
          } catch {}
        }
      };

      xhr.onload = () => resolve();
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(JSON.stringify({ messages }));
    }),

  getChatHistory: (): Promise<ChatMessage[]> =>
    get<any[]>('/coach/history').then((rows) =>
      rows.map((r) => ({
        id: r.id,
        role: r.role as 'user' | 'assistant',
        content: r.content,
        timestamp: r.created_at,
      })),
    ),

  clearChatHistory: () => del('/coach/history'),

  getPlans: () => get<any[]>('/workouts/plans').then((rows) => rows.map(fromBackendPlan)),

  createPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) =>
    post<any>('/workouts/plans', toBackendPlan(plan)).then(fromBackendPlan),

  deletePlan: (id: string) => del(`/workouts/plans/${id}`),

  getLogs: () => get<any[]>('/workouts/logs').then((rows) => rows.map(fromBackendLog)),

  createLog: (log: WorkoutLog) => post<any>('/workouts/logs', toBackendLog(log)).then(fromBackendLog),
};
