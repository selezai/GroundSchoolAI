import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { Document, documentService } from '../services/document';

interface Props {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete: (document: Document) => void;
  onRefresh: () => void;
}

const DocumentList: React.FC<Props> = ({
  documents,
  onDocumentSelect,
  onDocumentDelete,
  onRefresh,
}) => {
  const handleDelete = async (documentId: string) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;
      await onDocumentDelete(doc);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatFileSize = (size: number | undefined): string => {
    if (!size) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let fileSize = size;
    let unitIndex = 0;
  
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
  
    return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: Document['status']): string => {
    switch (status) {
      case 'analyzed':
        return theme.colors.success;
      case 'analyzing':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      case 'pending':
        return theme.colors.text;
      default:
        return theme.colors.text;
    }
  };

  const renderDocument = (document: Document) => {
    const fileType = document.file_type;
    const fileSize = document.file_size;

    return (
      <TouchableOpacity
        key={document.id}
        style={styles.documentItem}
        onPress={() => onDocumentSelect(document)}
      >
        <View style={styles.documentInfo}>
          <Icon
            name={fileType.includes('pdf') ? 'picture-as-pdf' : 'image'}
            type="material"
            size={24}
            color={theme.colors.primary}
            containerStyle={styles.iconContainer}
          />
          <View style={styles.documentDetails}>
            <Text style={styles.documentTitle} numberOfLines={1}>
              {document.title}
            </Text>
            <View style={styles.documentMeta}>
              <Text style={styles.documentCategory}>{document.category}</Text>
              <Text style={styles.documentSize}>
                {formatFileSize(fileSize)}
              </Text>
              <Text
                style={[
                  styles.documentStatus,
                  { color: getStatusColor(document.status) },
                ]}
              >
                {document.status}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(document.id)}
          style={styles.deleteButton}
        >
          <Icon
            name="delete-outline"
            type="material"
            size={24}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (documents.length === 0) {
    return (
      <Card containerStyle={styles.emptyContainer}>
        <Icon
          name="description"
          type="material"
          size={48}
          color={theme.colors.disabled}
        />
        <Text style={styles.emptyText}>No documents uploaded yet</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {documents.map(document => renderDocument(document))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.disabled,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentCategory: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  documentSize: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  documentStatus: {
    fontSize: theme.typography.caption.fontSize,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
});

export default DocumentList;
