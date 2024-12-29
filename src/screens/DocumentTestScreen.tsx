import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentViewer } from '../components/DocumentViewer';
import { Document, documentService } from '../services/document';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';

export const DocumentTestScreen: React.FC = () => {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const docs = await documentService.getUserDocuments(user.id);
      setDocuments(docs);
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

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      await documentService.deleteDocument(doc.id);
      Alert.alert('Success', 'Document deleted successfully');
      loadDocuments();
      if (selectedDocument?.id === doc.id) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete document');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to access documents</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>Documents</Text>
        <Button
          title="Upload New"
          onPress={() => setShowUpload(true)}
          type="outline"
        />
      </View>

      {showUpload ? (
        <DocumentUpload
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.documentList}>
            <ScrollView>
              {loading ? (
                <Text>Loading documents...</Text>
              ) : documents.length === 0 ? (
                <Text>No documents found</Text>
              ) : (
                documents.map((doc) => (
                  <View key={doc.id} style={styles.documentItem}>
                    <Button
                      title={doc.title}
                      type={selectedDocument?.id === doc.id ? 'solid' : 'clear'}
                      onPress={() => handleDocumentSelect(doc)}
                    />
                    <Button
                      title="Delete"
                      type="clear"
                      titleStyle={{ color: theme.colors.error }}
                      onPress={() => handleDeleteDocument(doc)}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={styles.documentViewer}>
            {selectedDocument ? (
              <DocumentViewer document={selectedDocument} />
            ) : (
              <Text style={styles.noDocument}>
                Select a document to view
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  documentList: {
    flex: 1,
    maxWidth: 300,
    borderRightWidth: 1,
    borderColor: theme.colors.grey5,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: theme.colors.grey5,
  },
  documentViewer: {
    flex: 2,
  },
  noDocument: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.grey3,
  },
});
