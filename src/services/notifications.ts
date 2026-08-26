import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('workouts', {
      name: 'Workout Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWorkoutReminder(hour: number, minute: number): Promise<string> {
  await cancelWorkoutReminders();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to train! 💪',
      body: "Your workout is waiting. Let's crush it today!",
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return id;
}

export async function cancelWorkoutReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const workoutNotifications = scheduled.filter((n) =>
    n.content.title?.includes('train'),
  );
  await Promise.all(
    workoutNotifications.map((n) =>
      Notifications.cancelScheduledNotificationAsync(n.identifier),
    ),
  );
}
