import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { Card, Text } from '@rneui/themed';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../config/theme';
import { documentService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Props {
  onUploadComplete: () => void;
  onClose: () => void;
}

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

const DocumentUpload: React.FC<Props> = ({ onUploadComplete, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [category, setCategory] = useState('');

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
        
        if (fileSize > 500 * 1024 * 1024) { // 500MB
          Alert.alert('Error', 'File size must be less than 500MB');
          return;
        }

        setSelectedFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || 'application/pdf',
          size: fileSize,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setLoading(true);

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Read file as blob
      const fileBlob = await fetch(selectedFile.uri).then(r => r.blob());

      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBlob, {
          contentType: selectedFile.mimeType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record in database
      await documentService.createDocument({
        user_id: user.id,
        title: selectedFile.name,
        file_path: filePath,
        file_type: selectedFile.mimeType,
        file_size: selectedFile.size || 0,
        category: category,
        status: 'active',
        version: 1
      });

      Alert.alert('Success', 'Document uploaded successfully');
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card containerStyle={styles.container}>
      <Card.Title>Upload Document</Card.Title>
      <Card.Divider />

      <View style={styles.content}>
        <Button
          title="Select File"
          onPress={handleFilePick}
          type="outline"
          buttonStyle={styles.selectButton}
          containerStyle={styles.buttonContainer}
        />

        {selectedFile && (
          <Text style={styles.fileName}>{selectedFile.name}</Text>
        )}

        <Input
          placeholder="Category (e.g., PPL, CPL)"
          value={category}
          onChangeText={setCategory}
          containerStyle={styles.inputContainer}
        />

        <View style={styles.buttonGroup}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            buttonStyle={styles.cancelButton}
            titleStyle={{ color: theme.colors.error }}
            containerStyle={[styles.buttonContainer, styles.buttonSpacing]}
          />
          <Button
            title="Upload"
            onPress={handleUpload}
            loading={loading}
            disabled={!selectedFile || !category}
            buttonStyle={styles.uploadButton}
            containerStyle={[styles.buttonContainer, styles.buttonSpacing]}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
  },
  content: {
    padding: theme.spacing.sm,
  },
  selectButton: {
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  buttonContainer: {
    marginVertical: theme.spacing.sm,
  },
  fileName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginVertical: theme.spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  buttonSpacing: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  cancelButton: {
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
});

export default DocumentUpload;
