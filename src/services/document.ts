import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: string;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
  version: number;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

class DocumentService {
  private generateFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  private async compressImage(uri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  async uploadDocument(
    fileUri: string,
    fileName: string,
    fileType: string,
    category: string,
    userId: string
  ): Promise<Document> {
    try {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(fileType)) {
        throw new Error('Invalid file type. Only PDF and images are allowed.');
      }

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 500MB limit.');
      }

      // Compress image if needed
      let finalUri = fileUri;
      if (fileType.startsWith('image/')) {
        finalUri = await this.compressImage(fileUri);
      }

      // Generate unique file name and path
      const uniqueFileName = this.generateFileName(fileName);
      const filePath = `${userId}/${uniqueFileName}`; // Changed to match our storage policy

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, {
          uri: finalUri,
          type: fileType,
          name: uniqueFileName,
        });

      if (uploadError) throw uploadError;

      // Create document record in database
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            user_id: userId,
            title: fileName,
            file_path: filePath,
            file_type: fileType,
            file_size: fileInfo.size,
            category,
            status: 'ready', // Changed from 'processing' since we're not doing processing yet
            version: 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async processDocument(documentId: string): Promise<void> {
    try {
      // Update status to processing
      await supabase
        .from('documents')
        .update({ status: 'processing' })
        .eq('id', documentId);

      // TODO: Implement document processing logic
      // 1. Extract text from PDF/Image
      // 2. Analyze content for SACAA compliance
      // 3. Generate AI questions
      // 4. Update document status to ready

      // For now, just mark as ready
      await supabase
        .from('documents')
        .update({ status: 'ready' })
        .eq('id', documentId);
    } catch (error) {
      console.error('Error processing document:', error);
      await supabase
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      throw error;
    }
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  }

  async getDocument(documentId: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async downloadDocument(filePath: string): Promise<string> {
    try {
      // First check if the file exists locally
      const fileName = filePath.split('/').pop()!;
      const localUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const localFileInfo = await FileSystem.getInfoAsync(localUri);
      if (localFileInfo.exists) {
        return localUri;
      }

      // If not, download from Supabase
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      // Convert blob to base64
      const fr = new FileReader();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      
      return new Promise((resolve, reject) => {
        fr.onerror = () => {
          fr.abort();
          reject(new Error('Failed to convert Blob to Base64'));
        };
        
        fr.onload = () => {
          // Write the file locally
          FileSystem.writeAsStringAsync(localUri, fr.result as string, {
            encoding: FileSystem.EncodingType.Base64,
          })
            .then(() => resolve(localUri))
            .catch(reject);
        };
        
        fr.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      const document = await this.getDocument(documentId);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async updateDocument(
    documentId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();
