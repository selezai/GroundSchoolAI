import { supabase } from './supabase';
import { config } from '../config/env';
import { PostgrestError } from '@supabase/supabase-js';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

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
  file_path: string;
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

      // Get document content
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (fileError) throw fileError;

      // Convert blob to text
      const content = await fileData.text();

      // Generate questions using Claude
      const message = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `You are an expert aviation instructor creating exam questions. Given this aviation document, generate ${count} questions of varying difficulty. Include the correct answer, three incorrect answers, and a brief explanation for each question.

Document content: ${content}

Format your response as a JSON array with this structure:
[{
  "content": "Question text",
  "correct_answer": "Correct answer",
  "incorrect_answers": ["Wrong 1", "Wrong 2", "Wrong 3"],
  "explanation": "Why this is the correct answer",
  "difficulty": "easy|medium|hard"
}]

Ensure questions:
1. Test understanding, not just memorization
2. Cover different aspects of the content
3. Are clear and unambiguous
4. Have plausible incorrect answers
5. Include helpful explanations`
        }]
      });

      // Extract the content from the first text block
      const textBlock = message.content.find(block => 
        block.type === 'text'
      );

      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('Unexpected response format from Claude');
      }

      const generatedQuestions = JSON.parse(textBlock.text) as Array<{
        content: string;
        correct_answer: string;
        incorrect_answers: string[];
        explanation: string;
        difficulty: Question['difficulty'];
      }>;

      // Prepare questions for database
      const questionsToInsert = generatedQuestions.map((q) => ({
        document_id: documentId,
        content: q.content,
        correct_answer: q.correct_answer,
        incorrect_answers: q.incorrect_answers,
        explanation: q.explanation,
        difficulty: q.difficulty,
        category: document.category,
        created_at: new Date().toISOString(),
        times_shown: 0,
        times_correct: 0,
      }));

      // Insert questions into database
      const { data: questions, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
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
        .select('*, documents!inner(*)');

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
      return (data as QuestionWithDocument[]) || [];
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  async recordAnswer(questionId: string, correct: boolean): Promise<void> {
    try {
      const { data: question, error: getError } = await supabase
        .from('questions')
        .select('times_shown, times_correct')
        .eq('id', questionId)
        .single();

      if (getError) throw getError;

      const timesShown = (question?.times_shown || 0) + 1;
      const timesCorrect = (question?.times_correct || 0) + (correct ? 1 : 0);

      const { error: updateError } = await supabase
        .from('questions')
        .update({
          last_shown: new Date().toISOString(),
          times_shown: timesShown,
          times_correct: timesCorrect,
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
