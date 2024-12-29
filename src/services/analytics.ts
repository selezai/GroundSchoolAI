import { supabase } from './supabase';

interface AnalyticsEvent {
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
}

interface StudyProgress {
  user_id: string;
  category: string;
  total_questions: number;
  correct_answers: number;
  study_time_minutes: number;
  last_activity: string;
}

class AnalyticsService {
  async trackEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase.from('analytics_events').insert([event]);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  async updateStudyProgress(
    userId: string,
    category: string,
    questionsAttempted: number,
    correctAnswers: number,
    studyTimeMinutes: number
  ): Promise<void> {
    try {
      const progress: StudyProgress = {
        user_id: userId,
        category,
        total_questions: questionsAttempted,
        correct_answers: correctAnswers,
        study_time_minutes: studyTimeMinutes,
        last_activity: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('study_progress')
        .upsert([progress], {
          onConflict: 'user_id,category',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating study progress:', error);
      throw error;
    }
  }

  async getStudyProgress(userId: string): Promise<StudyProgress[]> {
    try {
      const { data, error } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching study progress:', error);
      throw error;
    }
  }

  async getWeakAreas(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const weakAreas: Record<string, number> = {};
      data.forEach((progress) => {
        const accuracy = progress.correct_answers / progress.total_questions;
        weakAreas[progress.category] = accuracy;
      });

      return weakAreas;
    } catch (error) {
      console.error('Error analyzing weak areas:', error);
      throw error;
    }
  }

  async getStudyStreak(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('timestamp')
        .eq('user_id', userId)
        .eq('event_type', 'study_session')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!data.length) return 0;

      let streak = 0;
      const today = new Date();
      let currentDate = new Date(today.setHours(0, 0, 0, 0));

      for (const event of data) {
        const eventDate = new Date(event.timestamp);
        eventDate.setHours(0, 0, 0, 0);

        if (currentDate.getTime() - eventDate.getTime() <= streak * 24 * 60 * 60 * 1000) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating study streak:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
