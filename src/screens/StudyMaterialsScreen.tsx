import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Icon, Badge } from '@rneui/themed';
import { theme } from '../config/theme';
import DocumentUpload from '../components/DocumentUpload';
import DocumentViewer from '../components/DocumentViewer';
import { Document, documentService } from '../services/document';
import { documentAnalysisService, AnalysisResult } from '../services/documentAnalysis';
import { useAuth } from '../contexts/AuthContext';

const StudyMaterialsScreen = () => {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const docs = await documentService.getUserDocuments(user.id);
      setDocuments(docs);

      // Load analyses for all documents
      const analysesMap: Record<string, AnalysisResult> = {};
      for (const doc of docs) {
        const analysis = await documentAnalysisService.getDocumentAnalysis(doc.id);
        if (analysis) {
          analysesMap[doc.id] = analysis;
        }
      }
      setAnalyses(analysesMap);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadDocuments();
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      await documentService.deleteDocument(doc);
      Alert.alert('Success', 'Document deleted successfully');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete document');
    }
  };

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const renderDocumentCard = (document: Document) => {
    const analysis = analyses[document.id];
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'analyzed': return 'success';
        case 'analyzing': return 'warning';
        case 'failed': return 'error';
        default: return 'primary';
      }
    };

    return (
      <TouchableOpacity
        key={document.id}
        onPress={() => handleDocumentSelect(document)}
      >
        <Card containerStyle={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Text style={styles.documentTitle}>{document.title}</Text>
            <Badge
              value={document.status}
              status={getStatusColor(document.status || 'pending')}
              containerStyle={styles.badge}
            />
          </View>
          
          {analysis && (
            <View style={styles.analysisInfo}>
              <Text>Topics: {analysis.topics.length}</Text>
              <Text>Questions: {analysis.practice_questions.length}</Text>
            </View>
          )}
          
          <Text style={styles.documentMeta}>
            Category: {document.category}
          </Text>
          <View style={styles.cardButtons}>
            <Button
              title="View"
              type={selectedDocument?.id === document.id ? 'solid' : 'outline'}
              onPress={() => handleDocumentSelect(document)}
              containerStyle={styles.cardButton}
            />
            <Button
              title="Delete"
              type="outline"
              buttonStyle={{ borderColor: theme.colors.error }}
              titleStyle={{ color: theme.colors.error }}
              onPress={() => handleDeleteDocument(document)}
              containerStyle={styles.cardButton}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text h4 style={styles.noUserText}>Please log in to access study materials</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4>Study Materials</Text>
        <Button
          title="Upload Document"
          icon={
            <Icon
              name="upload"
              type="font-awesome"
              color="white"
              size={16}
              style={{ marginRight: 8 }}
            />
          }
          onPress={() => setShowUpload(true)}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : documents.length === 0 ? (
        <Card>
          <Card.Title>No Documents</Card.Title>
          <Text>Upload your first document to get started</Text>
        </Card>
      ) : (
        documents.map(renderDocumentCard)
      )}

      {showUpload ? (
        <DocumentUpload
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      ) : null}

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          visible={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  documentList: {
    flex: 1,
    maxWidth: 350,
  },
  documentCard: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  documentInfo: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.grey3,
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  cardButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  documentViewer: {
    flex: 2,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  noDocumentCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDocumentText: {
    color: theme.colors.grey3,
    fontSize: 16,
  },
  messageText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.grey3,
  },
  noUserText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  documentItem: {
    marginBottom: theme.spacing.sm,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    marginLeft: 8,
  },
  analysisInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  documentMeta: {
    fontSize: 14,
    color: theme.colors.grey3,
  },
});

export default StudyMaterialsScreen;
