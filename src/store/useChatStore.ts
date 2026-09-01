import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from '../utils/nanoid';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

const CHAT_KEY = '@fitai:chat';

interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => ChatMessage;
  updateMessage: (id: string, content: string) => void;
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

  updateMessage: (id, content) => {
    const messages = get().messages.map((m) => (m.id === id ? { ...m, content } : m));
    set({ messages });
    AsyncStorage.setItem(CHAT_KEY, JSON.stringify(messages)).catch(() => {});
  },

  setGenerating: (val) => set({ isGenerating: val }),

  clearHistory: async () => {
    set({ messages: [] });
    await AsyncStorage.removeItem(CHAT_KEY);
    api.clearChatHistory().catch(() => {});
  },

  hydrate: async () => {
    try {
      const backendMessages = await api.getChatHistory();
      if (backendMessages.length > 0) {
        set({ messages: backendMessages });
        await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(backendMessages));
        return;
      }
    } catch {}
    // Fall back to local cache
    try {
      const raw = await AsyncStorage.getItem(CHAT_KEY);
      if (raw) set({ messages: JSON.parse(raw) });
    } catch {}
  },
}));
