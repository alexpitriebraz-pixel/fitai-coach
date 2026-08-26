import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import './src/localization';
import i18n from './src/localization';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';
import { useAppStore } from './src/store/useAppStore';
import { useWorkoutStore } from './src/store/useWorkoutStore';
import { useSubscriptionStore } from './src/store/useSubscriptionStore';
import { useChatStore } from './src/store/useChatStore';
import { initRevenueCat } from './src/services/revenueCat';

export default function App() {
  const { hydrated: appHydrated, hydrate: hydrateApp, settings } = useAppStore();
  const { hydrate: hydrateWorkouts } = useWorkoutStore();
  const { hydrate: hydrateSub } = useSubscriptionStore();
  const { hydrate: hydrateChat } = useChatStore();

  useEffect(() => {
    const init = async () => {
      await Promise.all([hydrateApp(), hydrateWorkouts(), hydrateSub(), hydrateChat()]);
      await initRevenueCat();
    };
    init();
  }, []);

  // Sync i18n language with settings
  useEffect(() => {
    if (appHydrated) {
      i18n.changeLanguage(settings.language);
    }
  }, [appHydrated, settings.language]);

  if (!appHydrated) {
    return <LoadingSpinner />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
