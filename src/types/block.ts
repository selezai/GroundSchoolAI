export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: BlockMetadata;
}

export enum BlockType {
  TEXT = 'text',
  HEADING = 'heading',
  LIST = 'list',
  CODE = 'code',
  TABLE = 'table',
  IMAGE = 'image'
}

export interface BlockMetadata {
  level?: number; // For headings
  language?: string; // For code blocks
  columns?: number; // For tables
  rows?: number; // For tables
  [key: string]: any;
}
