import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { HomeScreen } from '../screens/main/HomeScreen';
import { CoachScreen } from '../screens/main/CoachScreen';
import { WorkoutsScreen } from '../screens/main/WorkoutsScreen';
import { ProgressScreen } from '../screens/main/ProgressScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    Home: '⚡',
    Coach: '🤖',
    Workouts: '💪',
    Progress: '📈',
    Settings: '⚙️',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 22 }}>{icons[name] ?? '●'}</Text>
    </View>
  );
}

export function BottomTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen name="Coach" component={CoachScreen} options={{ tabBarLabel: t('tabs.coach') }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{ tabBarLabel: t('tabs.workouts') }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: t('tabs.progress') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
