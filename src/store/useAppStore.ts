import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, AppSettings, Theme, Language, UnitSystem } from '../types';

const STORAGE_KEY = '@fitai:app';

interface AppState {
  profile: UserProfile | null;
  settings: AppSettings;
  isLoading: boolean;
  hydrated: boolean;

  setProfile: (profile: UserProfile) => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  setSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setUnitSystem: (unit: UnitSystem) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  unitSystem: 'metric',
  notificationsEnabled: false,
  workoutReminderTime: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  settings: defaultSettings,
  isLoading: false,
  hydrated: false,

  setProfile: async (profile) => {
    set({ profile });
    await persistState(get());
  },

  updateProfile: async (partial) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...partial };
    set({ profile: updated });
    await persistState(get());
  },

  setSettings: async (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await persistState(get());
  },

  setTheme: async (theme) => {
    await get().setSettings({ theme });
  },

  setLanguage: async (language) => {
    await get().setSettings({ language });
  },

  setUnitSystem: async (unitSystem) => {
    await get().setSettings({ unitSystem });
  },

  completeOnboarding: async () => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, onboardingComplete: true };
    set({ profile: updated });
    await persistState(get());
  },

  deleteAccount: async () => {
    await AsyncStorage.multiRemove(['@fitai:app', '@fitai:workouts', '@fitai:chat', '@fitai:sub']);
    set({ profile: null, settings: defaultSettings });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          profile: saved.profile ?? null,
          settings: { ...defaultSettings, ...saved.settings },
        });
      }
    } catch (_) {
      // start fresh
    } finally {
      set({ hydrated: true });
    }
  },
}));

async function persistState(state: AppState) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile: state.profile, settings: state.settings }),
    );
  } catch (_) {}
}
