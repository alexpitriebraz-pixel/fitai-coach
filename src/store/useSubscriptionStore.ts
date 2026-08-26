import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SubscriptionInfo } from '../types';
import { FREE_DAILY_MESSAGE_LIMIT } from '../constants';

const SUB_KEY = '@fitai:sub';

interface SubscriptionState extends SubscriptionInfo {
  hydrated: boolean;
  setIsPremium: (isPremium: boolean) => Promise<void>;
  incrementMessageUsage: () => Promise<void>;
  resetDailyUsage: () => Promise<void>;
  canSendMessage: () => boolean;
  hydrate: () => Promise<void>;
}

const today = () => new Date().toISOString().split('T')[0];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPremium: false,
  entitlements: [],
  dailyMessagesUsed: 0,
  dailyMessageLimit: FREE_DAILY_MESSAGE_LIMIT,
  currentOffering: null,
  hydrated: false,

  setIsPremium: async (isPremium) => {
    set({ isPremium });
    await persist(get());
  },

  incrementMessageUsage: async () => {
    const used = get().dailyMessagesUsed + 1;
    set({ dailyMessagesUsed: used });
    await persist(get());
  },

  resetDailyUsage: async () => {
    set({ dailyMessagesUsed: 0 });
    await persist(get());
  },

  canSendMessage: () => {
    const { isPremium, dailyMessagesUsed, dailyMessageLimit } = get();
    return isPremium || dailyMessagesUsed < dailyMessageLimit;
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(SUB_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Reset daily count if the saved date is not today
        const isToday = saved.date === today();
        set({
          isPremium: saved.isPremium ?? false,
          dailyMessagesUsed: isToday ? (saved.dailyMessagesUsed ?? 0) : 0,
        });
      }
    } catch (_) {
      // start fresh
    } finally {
      set({ hydrated: true });
    }
  },
}));

async function persist(state: SubscriptionState) {
  try {
    await AsyncStorage.setItem(
      SUB_KEY,
      JSON.stringify({
        isPremium: state.isPremium,
        dailyMessagesUsed: state.dailyMessagesUsed,
        date: today(),
      }),
    );
  } catch (_) {}
}
