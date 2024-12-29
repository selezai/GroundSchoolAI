import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type StudyProgress = Database['public']['Tables']['study_progress']['Row'];
type NotificationSettings = Database['public']['Tables']['notification_settings']['Row'];

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }
};

export const documentService = {
  async getDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    handleSupabaseError(error);
    return data || [];
  },

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }
};

export const questionService = {
  async getQuestions(documentId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });
    
    handleSupabaseError(error);
    return data || [];
  },

  async createQuestions(questions: Omit<Question, 'id' | 'created_at' | 'updated_at'>[]): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();
    
    handleSupabaseError(error);
    return data || [];
  },

  async updateQuestionStats(questionId: string, correct: boolean): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .update({
        times_shown: supabase.rpc('increment', { value: 1 }),
        times_correct: supabase.rpc('increment', { value: correct ? 1 : 0 }),
        last_shown: new Date().toISOString()
      })
      .eq('id', questionId);
    
    handleSupabaseError(error);
  }
};

export const studyProgressService = {
  async getProgress(userId: string, category: string): Promise<StudyProgress | null> {
    const { data, error } = await supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  async updateProgress(
    userId: string,
    category: string,
    updates: Partial<StudyProgress>
  ): Promise<StudyProgress> {
    const { data: existing } = await supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('study_progress')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      
      handleSupabaseError(error);
      return data;
    } else {
      const { data, error } = await supabase
        .from('study_progress')
        .insert({
          user_id: userId,
          category,
          ...updates
        })
        .select()
        .single();
      
      handleSupabaseError(error);
      return data;
    }
  }
};

export const notificationService = {
  async getSettings(userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  async updateSettings(
    userId: string,
    updates: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const { data: existing } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      
      handleSupabaseError(error);
      return data;
    } else {
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: userId,
          ...updates
        })
        .select()
        .single();
      
      handleSupabaseError(error);
      return data;
    }
  }
};
