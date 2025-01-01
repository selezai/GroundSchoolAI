import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { NotificationTriggerInput } from 'expo-notifications';

interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  async initialize(): Promise<void> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      throw error;
    }
  }

  async scheduleNotification(
    notification: NotificationContent,
    trigger: NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      throw error;
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      throw error;
    }
  }

  async registerPushToken(userId: string): Promise<void> {
    try {
      const token = await this.getPushToken();
      if (!token) return;

      const { error } = await supabase
        .from('push_tokens')
        .upsert([
          {
            user_id: userId,
            token,
            platform: Platform.OS,
            created_at: new Date().toISOString(),
          },
        ], {
          onConflict: 'user_id,token',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  private async getPushToken(): Promise<string | null> {
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Study reminder notifications
  async scheduleStudyReminder(
    time: Date,
    recurringDays: number[] = []
  ): Promise<string> {
    if (recurringDays.length) {
      return await this.scheduleWeeklyNotification(
        'Time to Study!',
        'Keep up your study streak and improve your aviation knowledge.',
        time.getHours(),
        time.getMinutes(),
        recurringDays[0]
      );
    } else {
      return await this.scheduleDateNotification(
        'Time to Study!',
        'Keep up your study streak and improve your aviation knowledge.',
        time
      );
    }
  }

  async scheduleWeeklyNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    weekday: number
  ): Promise<string> {
    const trigger = {
      channelId: 'default',
      type: 'weekly' as const,
      hour,
      minute,
      weekday,
    };

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger,
    });
  }

  async scheduleDateNotification(
    title: string,
    body: string,
    date: Date
  ): Promise<string> {
    const trigger = {
      channelId: 'default',
      type: 'date' as const,
      date,
    };

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger,
    });
  }

  // Exam preparation notifications
  async scheduleExamPreparation(examDate: Date): Promise<void> {
    const now = new Date();
    const daysUntilExam = Math.floor(
      (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExam <= 0) return;

    // Schedule notifications at different intervals
    const intervals = [30, 14, 7, 3, 1];
    for (const days of intervals) {
      if (daysUntilExam >= days) {
        const notificationDate = new Date(
          examDate.getTime() - days * 24 * 60 * 60 * 1000
        );

        await this.scheduleDateNotification(
          'Exam Preparation Reminder',
          `Your exam is in ${days} day${
            days > 1 ? 's' : ''
          }. Time to intensify your preparation!`,
          notificationDate
        );
      }
    }
  }

  // Achievement notifications
  async sendAchievementNotification(
    achievement: string,
    description: string
  ): Promise<void> {
    await this.scheduleNotification(
      {
        title: '🏆 New Achievement Unlocked!',
        body: `Congratulations! You've earned: ${achievement}\n${description}`,
      },
      null
    );
  }
}

export const notificationService = new NotificationService();
