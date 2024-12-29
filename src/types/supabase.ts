export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          subscription_status: string | null
          trial_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          status: string
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          status: string
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          file_path?: string
          file_type?: string
          file_size?: number
          category?: string
          status?: string
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          document_id: string
          content: string
          correct_answer: string
          incorrect_answers: string[]
          explanation: string
          difficulty: string
          category: string
          times_shown: number
          times_correct: number
          last_shown: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          correct_answer: string
          incorrect_answers: string[]
          explanation: string
          difficulty: string
          category: string
          times_shown?: number
          times_correct?: number
          last_shown?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          correct_answer?: string
          incorrect_answers?: string[]
          explanation?: string
          difficulty?: string
          category?: string
          times_shown?: number
          times_correct?: number
          last_shown?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_progress: {
        Row: {
          id: string
          user_id: string
          category: string
          total_questions: number
          correct_answers: number
          study_time_minutes: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          total_questions?: number
          correct_answers?: number
          study_time_minutes?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          total_questions?: number
          correct_answers?: number
          study_time_minutes?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          study_reminders: boolean
          reminder_time: string
          reminder_days: number[]
          exam_prep_notifications: boolean
          achievement_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          study_reminders?: boolean
          reminder_time?: string
          reminder_days?: number[]
          exam_prep_notifications?: boolean
          achievement_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          study_reminders?: boolean
          reminder_time?: string
          reminder_days?: number[]
          exam_prep_notifications?: boolean
          achievement_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
