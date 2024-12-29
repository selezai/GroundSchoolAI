import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

interface NotificationData {
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
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
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
    const trigger: Notifications.NotificationTriggerInput = recurringDays.length
      ? {
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
          weekday: recurringDays,
        }
      : {
          seconds: Math.floor((time.getTime() - Date.now()) / 1000),
        };

    return this.scheduleNotification(
      {
        title: 'Time to Study!',
        body: 'Keep up your study streak and improve your aviation knowledge.',
      },
      trigger
    );
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

        await this.scheduleNotification(
          {
            title: 'Exam Preparation Reminder',
            body: `Your exam is in ${days} day${
              days > 1 ? 's' : ''
            }. Time to intensify your preparation!`,
          },
          {
            date: notificationDate,
          }
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
