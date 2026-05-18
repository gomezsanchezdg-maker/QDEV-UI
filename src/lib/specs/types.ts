export interface Spec {
  name: string;
  displayName?: string;
  isEpic: boolean;
  isArchived: boolean;
  parentEpic?: string;
  order?: number;
  taskProgress?: {
    total: number;
    completed: number;
    pending: number;
  };
  phases: {
    requirements: { exists: boolean; approved?: boolean };
    design: { exists: boolean; approved?: boolean };
    tasks: { exists: boolean; approved?: boolean };
  };
  startedAt?: string;
  finishedAt?: string;
  lastModified: string;
  description?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  title: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  type: 'document' | 'action';
  category: 'spec' | 'steering';
  categoryName: string;
  createdAt: string;
  respondedAt?: string;
  response?: string;
  comments?: Comment[];
}

export interface Artifact {
  id: string;
  name: string;
  path: string;
}

export interface LogEntry {
  id: string;
  taskId: string;
  timestamp: string;
  summary: string;
  filesModified: string[];
  filesCreated: string[];
  artifacts?: Artifact[];
}

export interface LogData {
  specName: string;
  entries: LogEntry[];
  stats?: {
    totalEntries: number;
    totalFilesChanged: number;
  };
}

export interface TaskData {
  specName: string;
  tasks: { id: string; title: string; status: 'pending' | 'active' | 'done' }[];
}

export interface Doc {
  id: string;
  title: string;
  path: string;
  type: string;
}

export interface SteeringDoc {
  id: string;
  title: string;
  path: string;
}

export interface Category {
  id: string;
  name: string;
}
