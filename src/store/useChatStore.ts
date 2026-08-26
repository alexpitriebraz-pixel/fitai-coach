import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from '../utils/nanoid';
import type { ChatMessage } from '../types';

const CHAT_KEY = '@fitai:chat';

interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => ChatMessage;
  setGenerating: (val: boolean) => void;
  clearHistory: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isGenerating: false,

  addMessage: (role, content) => {
    const msg: ChatMessage = {
      id: nanoid(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    const messages = [...get().messages, msg];
    set({ messages });
    AsyncStorage.setItem(CHAT_KEY, JSON.stringify(messages)).catch(() => {});
    return msg;
  },

  setGenerating: (val) => set({ isGenerating: val }),

  clearHistory: async () => {
    set({ messages: [] });
    await AsyncStorage.removeItem(CHAT_KEY);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(CHAT_KEY);
      if (raw) {
        set({ messages: JSON.parse(raw) });
      }
    } catch (_) {}
  },
}));
