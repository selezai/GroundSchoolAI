import { Document } from '../types/document';
import { Block } from '../types/block';
import { supabase } from './supabase';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY, CLAUDE_MODEL } from '@env';
import { config } from '../config/env';

const anthropicClient = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export interface AnalysisResult {
  document_id: string;
  topics: Topic[];
  summary: string;
  study_points: string[];
  practice_questions: PracticeQuestion[];
}

export interface Topic {
  title: string;
  content: string;
  importance_level: 1 | 2 | 3;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ClaudeResponse {
  type: 'text';
  text: string;
}

export class DocumentAnalysisService {
  async analyzeDocument(document: Document): Promise<void> {
    try {
      if (!document.id || !document.file_path) {
        throw new Error('Document ID and file path are required for analysis');
      }

      // Get the document content
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (fileError) {
        throw fileError;
      }

      // Convert blob to text
      const content = await fileData.text();

      // Analyze the content using Claude
      const message = await anthropicClient.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Analyze this aviation study material and extract key information:

${content}

Format your response as JSON with these fields:
{
  "topics": [{"name": string, "importance": "high" | "medium" | "low"}],
  "summary": string,
  "studyPoints": string[],
  "practiceQuestions": [{"question": string, "answer": string}]
}`
        }],
      });

      const responseContent = message.content[0] as ClaudeResponse;
      if (responseContent.type !== 'text' || !responseContent.text) {
        throw new Error('Invalid response from Claude');
      }

      // Extract the analysis result
      const analysis = JSON.parse(responseContent.text);

      // Store the analysis results
      const { error: analysisError } = await supabase
        .from('document_analyses')
        .insert([
          {
            document_id: document.id,
            topics: analysis.topics.map((topic: any) => ({
              title: topic.name,
              content: '',
              importance_level: topic.importance === 'high' ? 1 : topic.importance === 'medium' ? 2 : 3,
            })),
            summary: analysis.summary,
            study_points: analysis.studyPoints,
            practice_questions: analysis.practiceQuestions.map((question: any) => ({
              question: question.question,
              options: [],
              correct_answer: question.answer,
              explanation: '',
              topic: '',
              difficulty: 'easy',
            })),
          },
        ]);

      if (analysisError) {
        throw analysisError;
      }

    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  async getDocumentAnalysis(documentId: string): Promise<AnalysisResult | null> {
    try {
      const { data, error } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error) throw error;
      return data as AnalysisResult;
    } catch (error) {
      console.error('Error getting document analysis:', error);
      return null;
    }
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
