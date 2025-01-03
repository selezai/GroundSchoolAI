import { Block } from './block';

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: {
    [key: string]: any;
  };
  blocks?: Block[];
}

export interface DocumentMetadata {
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  tags?: string[];
  [key: string]: any;
}
