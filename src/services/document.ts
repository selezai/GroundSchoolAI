import { supabase } from './supabase';
import { FileObject } from '@supabase/storage-js';
import { Database } from '../types/supabase';
import { documentAnalysisService } from './documentAnalysis';

// Import FileSystem based on environment
let FileSystem: any;
if (process.env.NODE_ENV === 'test') {
  FileSystem = require('../tests/mocks/expo-file-system');
} else {
  FileSystem = require('expo-file-system');
}

export interface Document {
  id: string;
  title: string;
  category: string;
  file_path: string;
  file_type: string;
  file_size: number;
  url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  size?: number;
  type?: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
}

interface FileInfo {
  exists: boolean;
  uri: string;
  size?: number;
  modificationTime?: number;
  isDirectory?: boolean;
}

export class DocumentService {
  private readonly documentsDir: string;
  private supabase: any;
  private isTestEnvironment: boolean;

  constructor(supabase: any) {
    this.supabase = supabase;
    this.documentsDir = `${FileSystem.documentDirectory}documents/`;
    this.isTestEnvironment = process.env.NODE_ENV === 'test';
    this.initializeDirectory();
  }

  private async initializeDirectory() {
    const { exists } = await FileSystem.getInfoAsync(this.documentsDir);
    if (!exists) {
      await FileSystem.makeDirectoryAsync(this.documentsDir, { intermediates: true });
    }
  }

  async uploadDocument(
    file: { uri: string; name: string; type: string; data?: Uint8Array; size?: number },
    metadata: { title: string; category: string }
  ): Promise<Document> {
    let document: Document | null = null;
    let filePath: string | null = null;

    try {
      // Check if user is authenticated
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session && !this.isTestEnvironment) {
        throw new Error('User must be authenticated to upload documents');
      }

      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Calculate file size
      let fileSize = file.size;
      if (!fileSize && file.data) {
        fileSize = file.data.byteLength;
      }
      if (!fileSize) {
        throw new Error('File size is required');
      }

      // Create document record with initial status
      const { data, error } = await this.supabase
        .from('documents')
        .insert([
          {
            title: metadata.title,
            category: metadata.category,
            user_id: userId,
            status: 'pending',
            file_type: file.type,
            file_size: fileSize,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      document = data as Document;

      if (!document || !document.id) {
        throw new Error('Failed to create document record');
      }

      // Upload file to storage
      filePath = `${userId}/${document.id}/${metadata.title}`;
      const { error: uploadError } = await this.supabase.storage
        .from('documents')
        .upload(filePath, file.data || file);

      if (uploadError) {
        throw uploadError;
      }

      // Update document with file path and start analysis
      const { data: updatedDoc, error: updateError } = await this.supabase
        .from('documents')
        .update({
          file_path: filePath,
          status: 'analyzing',
        })
        .eq('id', document.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!updatedDoc) {
        throw new Error('Failed to update document');
      }

      const docWithPath = { ...updatedDoc, file_path: filePath } as Document;

      // Start document analysis
      await documentAnalysisService.analyzeDocument(docWithPath);
      
      // Update document status to analyzed
      const { error: finalError } = await this.supabase
        .from('documents')
        .update({ status: 'analyzed' })
        .eq('id', document.id);

      if (finalError) {
        throw finalError;
      }

      return docWithPath;
    } catch (error) {
      console.error('Error analyzing document:', error);
      // Update document status to failed if we have a document ID
      if (document?.id) {
        await this.supabase
          .from('documents')
          .update({ status: 'failed' })
          .eq('id', document.id);
      }
      throw error;
    }
  }

  async getSignedUrl(file_path: string): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from('documents')
        .createSignedUrl(file_path, 3600);

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Failed to get signed URL');

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  async downloadDocument(document: Document): Promise<string> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session && !this.isTestEnvironment) {
        throw new Error('User must be authenticated to download documents');
      }

      const localUri = `${this.documentsDir}${document.title}`;
      const fileInfo = await FileSystem.getInfoAsync(localUri);

      if (fileInfo.exists) {
        return localUri;
      }

      const signedUrl = await this.getSignedUrl(document.file_path);

      // Download file
      const { uri: downloadedUri } = await FileSystem.downloadAsync(
        signedUrl,
        localUri
      );

      return downloadedUri;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session && !this.isTestEnvironment) {
        throw new Error('User must be authenticated to access documents');
      }

      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  }

  async getAnalyzedDocuments(): Promise<Document[]> {
    try {
      const { data: documents, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('status', 'analyzed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return documents || [];
    } catch (error) {
      console.error('Error getting analyzed documents:', error);
      throw error;
    }
  }

  async deleteDocument(document: Document): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session && !this.isTestEnvironment) {
        throw new Error('User must be authenticated to delete documents');
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', document.id)
        .eq('user_id', session.user.id); // Extra safety check

      if (dbError) throw dbError;

      // Delete local file if it exists
      const localUri = `${this.documentsDir}${document.title}`;
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService(supabase);
