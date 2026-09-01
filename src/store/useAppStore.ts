import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
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
    await persistLocal(get());
    api.updateProfile(profile).catch(() => {});
  },

  updateProfile: async (partial) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...partial };
    set({ profile: updated });
    await persistLocal(get());
    api.updateProfile(updated).catch(() => {});
  },

  setSettings: async (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await persistLocal(get());
  },

  setTheme: async (theme) => get().setSettings({ theme }),
  setLanguage: async (language) => get().setSettings({ language }),
  setUnitSystem: async (unitSystem) => get().setSettings({ unitSystem }),

  completeOnboarding: async () => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, onboardingComplete: true };
    set({ profile: updated });
    await persistLocal(get());
    api.updateProfile(updated).catch(() => {});
  },

  deleteAccount: async () => {
    await api.deleteAccount().catch(() => {});
    await AsyncStorage.multiRemove(['@fitai:app', '@fitai:workouts', '@fitai:chat', '@fitai:sub', '@fitai:device_id']);
    set({ profile: null, settings: defaultSettings });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const local = raw ? JSON.parse(raw) : null;

      // Restore local settings immediately for fast UI
      if (local?.settings) {
        set({ settings: { ...defaultSettings, ...local.settings } });
      }

      // Fetch/create backend profile
      const backendProfile = await api.getProfile();

      // If local has completed onboarding but backend doesn't (first sync after upgrade), push local data
      if (local?.profile?.onboardingComplete && !backendProfile.onboardingComplete) {
        await api.updateProfile(local.profile).catch(() => {});
        set({ profile: local.profile });
      } else {
        set({ profile: backendProfile.onboardingComplete ? backendProfile : (local?.profile ?? null) });
      }
    } catch {
      // Offline — fall back to local
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          set({ profile: saved.profile ?? null, settings: { ...defaultSettings, ...saved.settings } });
        }
      } catch {}
    } finally {
      set({ hydrated: true });
    }
  },
}));

async function persistLocal(state: AppState) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile: state.profile, settings: state.settings }),
    );
  } catch {}
}
