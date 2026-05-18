export type MessageRole = 'user' | 'assistant';

export interface FileRef {
  name: string;
  path: string;
  type: 'ts' | 'html' | 'css' | 'js' | 'svelte' | 'other';
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  fileRefs?: FileRef[];
  timestamp: Date;
}

export type TabId = 'session' | 'changes';

export type ModelId = 'gemini-3-flash' | 'gpt-4o' | 'claude-sonnet' | 'claude-haiku';
export type ModeId = 'build' | 'ask' | 'debug';
