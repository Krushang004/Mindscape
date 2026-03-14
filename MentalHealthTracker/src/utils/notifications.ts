import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleDailyReminder(timeString: string) {
  try {
    if (Platform.OS === 'android') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions');
        return;
      }
    }

    // Cancel existing notifications to avoid duplicates
    await cancelAllReminders();

    const [hours, minutes] = timeString.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "How's your mental health today? 🌿",
        body: "Take a moment to log your daily entry and track your progress.",
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      } as any,
    });

    console.log(`Scheduled daily reminder for ${timeString}`);
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
}

export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all existing reminders');
  } catch (error) {
    console.error('Error cancelling reminders:', error);
  }
}
