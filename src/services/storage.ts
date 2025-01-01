import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { FileObject } from '@supabase/storage-js';

type StorageMetadata = Record<string, string>;

class StorageService {
  private readonly PREFIX = '@GroundSchoolAI:';

  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(this.PREFIX + key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.PREFIX + key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.PREFIX));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(this.PREFIX))
                 .map(key => key.replace(this.PREFIX, ''));
    } catch (error) {
      console.error('Error getting keys:', error);
      throw error;
    }
  }

  async multiGet(keys: string[]): Promise<Array<[string, any]>> {
    try {
      const prefixedKeys = keys.map(key => this.PREFIX + key);
      const pairs = await AsyncStorage.multiGet(prefixedKeys);
      return pairs.map(([key, value]) => [
        key.replace(this.PREFIX, ''),
        value ? JSON.parse(value) : null,
      ]);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      throw error;
    }
  }

  async multiSet(keyValuePairs: Array<{ key: string; value: any }>): Promise<void> {
    try {
      const prefixedPairs = keyValuePairs.map(({ key, value }) => [
        this.PREFIX + key,
        JSON.stringify(value),
      ]) as [string, string][];
      await AsyncStorage.multiSet(prefixedPairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      const pairs = await this.multiGet(keys);
      return pairs.reduce((size, [_, value]) => {
        return size + (JSON.stringify(value)?.length || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating storage size:', error);
      throw error;
    }
  }

  // Study session specific methods
  async saveStudySession(sessionData: {
    timestamp: number;
    duration: number;
    category: string;
    questionsAttempted: number;
    correctAnswers: number;
  }): Promise<void> {
    try {
      const sessions = await this.get<any[]>('studySessions') || [];
      sessions.push(sessionData);
      await this.set('studySessions', sessions);
    } catch (error) {
      console.error('Error saving study session:', error);
      throw error;
    }
  }

  async getStudySessions(): Promise<any[]> {
    try {
      return await this.get<any[]>('studySessions') || [];
    } catch (error) {
      console.error('Error getting study sessions:', error);
      throw error;
    }
  }

  // Offline data management
  async saveOfflineData(data: any): Promise<void> {
    try {
      const offlineData = await this.get<any[]>('offlineData') || [];
      offlineData.push({
        ...data,
        timestamp: Date.now(),
        synced: false,
      });
      await this.set('offlineData', offlineData);
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  }

  async getUnSyncedData(): Promise<any[]> {
    try {
      const offlineData = await this.get<any[]>('offlineData') || [];
      return offlineData.filter(item => !item.synced);
    } catch (error) {
      console.error('Error getting unsynced data:', error);
      throw error;
    }
  }

  async markDataAsSynced(timestamps: number[]): Promise<void> {
    try {
      const offlineData = await this.get<any[]>('offlineData') || [];
      const updatedData = offlineData.map(item => {
        if (timestamps.includes(item.timestamp)) {
          return { ...item, synced: true };
        }
        return item;
      });
      await this.set('offlineData', updatedData);
    } catch (error) {
      console.error('Error marking data as synced:', error);
      throw error;
    }
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Blob | File | FormData | string,
    metadata?: StorageMetadata,
    options?: {
      contentType?: string;
      upsert?: boolean;
      cacheControl?: string;
    }
  ): Promise<{ path: string; url: string }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        metadata,
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
        contentType: options?.contentType,
      });

    if (error) throw error;
    if (!data) throw new Error('Upload failed');

    return {
      path: data.path,
      url: supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl,
    };
  }
}

export const storageService = new StorageService();
