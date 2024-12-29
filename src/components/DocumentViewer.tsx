import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import PDFReader from 'rn-pdf-reader-js';
import { Image, Text } from '@rneui/themed';
import { theme } from '../config/theme';
import { Document, documentService } from '../services/document';

interface Props {
  document: Document;
}

const DocumentViewer: React.FC<Props> = ({ document }) => {
  const [loading, setLoading] = useState(true);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [document]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const uri = await documentService.downloadDocument(document.file_path);
      setLocalUri(uri);
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!localUri) {
    return null;
  }

  if (document.file_type.includes('pdf')) {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' ? (
          <WebView
            source={{ uri: localUri }}
            style={styles.webview}
            scrollEnabled={true}
          />
        ) : (
          <PDFReader
            source={{ uri: localUri }}
            style={styles.container}
          />
        )}
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
          PlaceholderContent={<ActivityIndicator />}
        />
      </View>
    );
  }

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>Unsupported file type</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  webview: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
  },
});

export default DocumentViewer;
