import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';
import { OnboardingNavigator } from './OnboardingNavigator';
import { BottomTabNavigator } from './BottomTabNavigator';
import { PaywallScreen } from '../screens/paywall/PaywallScreen';
import { PrivacyPolicyScreen } from '../screens/legal/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/legal/TermsOfServiceScreen';
import { DataDeletionScreen } from '../screens/legal/DataDeletionScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const profile = useAppStore((s) => s.profile);
  const { colors } = useTheme();
  const isOnboarded = profile?.onboardingComplete === true;

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        )}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: true, title: 'Privacy Policy' }}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{ headerShown: true, title: 'Terms of Service' }}
        />
        <Stack.Screen
          name="DataDeletion"
          component={DataDeletionScreen}
          options={{ headerShown: true, title: 'Delete Account' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
