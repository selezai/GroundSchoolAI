import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Dimensions, Text, TouchableOpacity } from 'react-native';
import Pdf from 'react-native-pdf';
import { Document, documentService } from '../services/document';
import { theme } from '../config/theme';

interface DocumentViewerProps {
  document: Document;
  visible: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadDocument();
    }
  }, [document, visible]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const uri = await documentService.downloadDocument(document);
      setLocalUri(uri);
      setError(null);
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  if (!localUri) {
    return null;
  }

  if (document.file_type.includes('pdf')) {
    const source = { uri: localUri, cache: true };

    return (
      <View style={styles.container}>
        <Pdf
          source={source}
          style={styles.pdf}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Loaded ${numberOfPages} pages from ${filePath}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}/${numberOfPages}`);
          }}
          onError={(error) => {
            console.error('PDF Error:', error);
          }}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (document.file_type.includes('image')) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: localUri }}
          style={styles.image}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Unsupported document type</Text>
      <Text style={styles.errorSubtext}>Please upload a PDF or image file</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.h4.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorSubtext: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    textAlign: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  closeButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
});

export default DocumentViewer;
