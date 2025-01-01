import { supabase } from './supabase';
import { config } from '../config/env';

export interface Message {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  context?: {
    document_id?: string;
    question_id?: string;
  };
}

class InstructorService {
  async sendMessage(
    userId: string,
    content: string,
    context?: Message['context']
  ): Promise<Message> {
    try {
      // Store user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            user_id: userId,
            content,
            role: 'user',
            context,
          },
        ])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Get relevant context if needed
      let contextualContent = '';
      if (context?.document_id) {
        const { data: document } = await supabase
          .from('documents')
          .select('*')
          .eq('id', context.document_id)
          .single();

        if (document) {
          contextualContent += `\nContext from document "${document.title}": ${document.content}`;
        }
      }

      if (context?.question_id) {
        const { data: question } = await supabase
          .from('questions')
          .select('*')
          .eq('id', context.question_id)
          .single();

        if (question) {
          contextualContent += `\nContext from question: ${question.content}\nCorrect answer: ${question.correct_answer}\nExplanation: ${question.explanation}`;
        }
      }

      // Get conversation history
      const { data: history } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Prepare conversation for Claude
      const conversation = history
        ? history
            .reverse()
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join('\n')
        : '';

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.anthropic.claude,
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: `You are an aviation instructor helping students prepare for their SACAA exams. 
              Provide clear, accurate, and helpful responses to questions about aviation topics.
              If you're unsure about something, say so rather than providing potentially incorrect information.
              ${contextualContent}`,
            },
            {
              role: 'user',
              content: conversation + '\nuser: ' + content,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Claude');
      }

      const claudeResponse = await response.json();

      // Store assistant message
      const { data: assistantMessage, error: assistantMessageError } = await supabase
        .from('messages')
        .insert([
          {
            user_id: userId,
            content: claudeResponse.content,
            role: 'assistant',
            context,
          },
        ])
        .select()
        .single();

      if (assistantMessageError) throw assistantMessageError;

      return assistantMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessageHistory(
    userId: string,
    limit: number = 50
  ): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.reverse();
    } catch (error) {
      console.error('Error fetching message history:', error);
      throw error;
    }
  }

  async clearMessageHistory(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing message history:', error);
      throw error;
    }
  }
}

export const instructorService = new InstructorService();
