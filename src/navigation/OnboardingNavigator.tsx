import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { GoalScreen } from '../screens/onboarding/GoalScreen';
import { ProfileScreen } from '../screens/onboarding/ProfileScreen';
import { EquipmentScreen } from '../screens/onboarding/EquipmentScreen';
import { HealthDisclaimerScreen } from '../screens/onboarding/HealthDisclaimerScreen';
import type { OnboardingStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Equipment" component={EquipmentScreen} />
      <Stack.Screen name="HealthDisclaimer" component={HealthDisclaimerScreen} />
    </Stack.Navigator>
  );
}
