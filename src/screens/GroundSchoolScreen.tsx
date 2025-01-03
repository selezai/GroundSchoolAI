import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, Button } from '@rneui/themed';
import { theme } from '../config/theme';
import { Document, documentService } from '../services/document';
import { supabase } from '../services/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env';
import { ANTHROPIC_API_KEY, CLAUDE_MODEL } from '@env';

const anthropicClient = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

interface SimplifiedContent {
  topic: string;
  explanation: string;
  keyPoints: string[];
}

interface MessageBlock {
  type: string;
  text?: string;
}

const GroundSchoolScreen = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [simplifiedContent, setSimplifiedContent] = useState<SimplifiedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getAnalyzedDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    }
  };

  const simplifyContent = async (document: Document) => {
    try {
      setLoading(true);
      setSelectedDocument(document);
      
      // Get the document content
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (fileError) throw fileError;

      // Convert blob to text
      const content = await fileData.text();

      // Use Claude to simplify the content
      const message = await anthropicClient.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `You are an expert aviation instructor. Please analyze this aviation document and explain its content in a simple, easy-to-understand format. Focus on:
          1. The main topic or concept
          2. A clear, simplified explanation that a beginner can understand
          3. Key points to remember

Document content: ${content}

Format your response as a JSON object with this structure:
{
  "topic": "Main topic or concept",
  "explanation": "Simplified explanation",
  "keyPoints": ["Key point 1", "Key point 2", ...]
}`
        }]
      });

      // Extract the content from the first text block
      const textBlock = message.content.find((block: MessageBlock) => 
        block.type === 'text'
      );

      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('Unexpected response format from Claude');
      }

      const simplified = JSON.parse(textBlock.text) as SimplifiedContent;
      setSimplifiedContent(simplified);
      setError(null);
    } catch (error) {
      console.error('Error simplifying content:', error);
      setError('Failed to simplify document content');
      setSimplifiedContent(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ground School</Text>
        <Text style={styles.subtitle}>Select a document to study</Text>
      </View>

      {error && (
        <Card containerStyle={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Processing document...</Text>
        </View>
      ) : (
        <>
          {/* Document List */}
          <View style={styles.documentList}>
            {documents.map((doc) => (
              <Card key={doc.id} containerStyle={styles.documentCard}>
                <Card.Title>{doc.title}</Card.Title>
                <Card.Divider />
                <Text style={styles.documentCategory}>{doc.category}</Text>
                <Button
                  title="Study"
                  onPress={() => simplifyContent(doc)}
                  buttonStyle={styles.studyButton}
                  disabled={loading}
                />
              </Card>
            ))}
          </View>

          {/* Simplified Content */}
          {simplifiedContent && selectedDocument && (
            <Card containerStyle={styles.contentCard}>
              <Card.Title>{selectedDocument.title}</Card.Title>
              <Card.Divider />
              
              <Text style={styles.sectionTitle}>Topic</Text>
              <Text style={styles.topic}>{simplifiedContent.topic}</Text>

              <Text style={styles.sectionTitle}>Explanation</Text>
              <Text style={styles.explanation}>{simplifiedContent.explanation}</Text>

              <Text style={styles.sectionTitle}>Key Points</Text>
              {simplifiedContent.keyPoints.map((point, index) => (
                <View key={index} style={styles.keyPoint}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.grey3,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
  },
  errorCard: {
    backgroundColor: theme.colors.error + '10',
    margin: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  documentList: {
    padding: theme.spacing.sm,
  },
  documentCard: {
    margin: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  documentCategory: {
    color: theme.colors.grey3,
    marginBottom: theme.spacing.md,
  },
  studyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  contentCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  topic: {
    fontSize: theme.typography.h4.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  explanation: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  bulletPoint: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  keyPointText: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
});

export default GroundSchoolScreen;
