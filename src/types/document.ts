import { Block } from './block';

export interface Document {
  id: string;
  title: string;
  content?: string;
  category: string;
  file_path: string;
  file_type: string;
  file_size: number;
  url?: string;
  metadata?: DocumentMetadata;
  blocks?: Block[];
  user_id?: string;
}

export interface DocumentMetadata {
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  tags?: string[];
  [key: string]: any;
}
