import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Icon } from '@rneui/themed';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentViewer } from '../components/DocumentViewer';
import { Document, documentService } from '../services/document';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';

const StudyMaterialsScreen = () => {
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
        <Text h4 style={styles.noUserText}>Please log in to access study materials</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with upload button */}
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

      {showUpload ? (
        <DocumentUpload
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      ) : (
        <View style={styles.content}>
          {/* Document List */}
          <ScrollView style={styles.documentList}>
            {loading ? (
              <Text style={styles.messageText}>Loading documents...</Text>
            ) : documents.length === 0 ? (
              <Text style={styles.messageText}>No documents found</Text>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id} containerStyle={styles.documentCard}>
                  <Card.Title>{doc.title}</Card.Title>
                  <Card.Divider />
                  <Text style={styles.documentInfo}>
                    Category: {doc.category}
                  </Text>
                  <Text style={styles.documentInfo}>
                    Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                  <View style={styles.cardButtons}>
                    <Button
                      title="View"
                      type={selectedDocument?.id === doc.id ? 'solid' : 'outline'}
                      onPress={() => setSelectedDocument(doc)}
                      containerStyle={styles.cardButton}
                    />
                    <Button
                      title="Delete"
                      type="outline"
                      buttonStyle={{ borderColor: theme.colors.error }}
                      titleStyle={{ color: theme.colors.error }}
                      onPress={() => handleDeleteDocument(doc)}
                      containerStyle={styles.cardButton}
                    />
                  </View>
                </Card>
              ))
            )}
          </ScrollView>

          {/* Document Viewer */}
          <View style={styles.documentViewer}>
            {selectedDocument ? (
              <DocumentViewer document={selectedDocument} />
            ) : (
              <Card containerStyle={styles.noDocumentCard}>
                <Text style={styles.noDocumentText}>
                  Select a document to view
                </Text>
              </Card>
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
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
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
});

export default StudyMaterialsScreen;
