import { supabase } from './supabase';
import { config } from '../config/env';
import { PostgrestError } from '@supabase/supabase-js';

export interface Question {
  id: string;
  document_id: string;
  content: string;
  correct_answer: string;
  incorrect_answers: string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  created_at: string;
  last_shown?: string | null;
  times_shown?: number | null;
  times_correct?: number | null;
}

interface Document {
  id: string;
  title: string;
  category: string;
  user_id: string;
}

interface QuestionWithDocument extends Question {
  documents: Document;
}

class QuestionService {
  async generateQuestions(documentId: string, count: number = 10): Promise<Question[]> {
    try {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        throw new Error(docError?.message || 'Document not found');
      }

      // TODO: Implement AI-based question generation using Claude API
      // For now, return mock questions
      const mockQuestions: Omit<Question, 'id'>[] = Array(count).fill(null).map((_, index) => ({
        document_id: documentId,
        content: `Sample question ${index + 1} for ${document.title}`,
        correct_answer: 'Correct answer',
        incorrect_answers: [
          'Incorrect answer 1',
          'Incorrect answer 2',
          'Incorrect answer 3',
        ],
        explanation: 'Sample explanation',
        difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
        category: document.category,
        created_at: new Date().toISOString(),
        times_shown: 0,
        times_correct: 0,
      }));

      const { data: questions, error } = await supabase
        .from('questions')
        .insert(mockQuestions)
        .select();

      if (error) throw error;
      return questions || [];
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  async getQuestions(
    userId: string,
    filters: {
      category?: string;
      difficulty?: Question['difficulty'];
      limit?: number;
    } = {}
  ): Promise<Question[]> {
    try {
      let query = supabase
        .from('questions')
        .select('*, documents!inner(*)') as any;

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      // Filter by user_id through documents table
      query = query.eq('documents.user_id', userId);

      // Order by spaced repetition algorithm
      query = query.order('last_shown', { ascending: true, nullsFirst: true });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return [];

      return data.map((q: QuestionWithDocument) => ({
        ...q,
        times_shown: q.times_shown || 0,
        times_correct: q.times_correct || 0,
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async recordAnswer(questionId: string, correct: boolean): Promise<void> {
    try {
      const updates = {
        last_shown: new Date().toISOString(),
        times_shown: undefined as any,
        times_correct: undefined as any,
      };

      // First get current values
      const { data: currentQuestion, error: fetchError } = await supabase
        .from('questions')
        .select('times_shown, times_correct')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new values
      const currentTimesShown = currentQuestion?.times_shown ?? 0;
      const currentTimesCorrect = currentQuestion?.times_correct ?? 0;

      // Update with new values
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          last_shown: new Date().toISOString(),
          times_shown: currentTimesShown + 1,
          times_correct: correct ? currentTimesCorrect + 1 : currentTimesCorrect,
        })
        .eq('id', questionId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error recording answer:', error);
      throw error;
    }
  }

  async deleteQuestions(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('document_id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting questions:', error);
      throw error;
    }
  }

  calculateNextReviewDate(
    lastShown: string | null,
    timesCorrect: number | null,
    timesShown: number | null
  ): Date {
    const now = new Date();
    
    // If never shown before or has null values, show immediately
    if (!lastShown || timesCorrect === null || timesShown === null) {
      return now;
    }

    // Calculate success rate
    const successRate = timesShown > 0 ? timesCorrect / timesShown : 0;
    const lastShownDate = new Date(lastShown);
    const daysSinceLastShown = Math.max(
      1, 
      Math.floor((now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Base interval increases exponentially with correct answers but is affected by success rate
    let interval = Math.pow(2, timesCorrect) * (0.5 + (0.5 * successRate));

    // Adjust interval based on recent performance
    if (successRate < 0.5) {
      interval = Math.max(1, interval * 0.5); // Review sooner if struggling
    } else if (successRate > 0.8) {
      interval = interval * 1.2; // Extend interval if doing well
    }

    // Cap maximum interval at 60 days
    interval = Math.min(60, Math.max(1, Math.round(interval)));

    const nextDate = new Date(lastShownDate);
    nextDate.setDate(nextDate.getDate() + interval);

    // If next review date is in the past, schedule for today
    return nextDate < now ? now : nextDate;
  }
}

export const questionService = new QuestionService();
