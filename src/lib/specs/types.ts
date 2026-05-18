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
  description?: string;
  comments?: Comment[];
  revisionHistory?: {
    version: number;
    content: string;
    timestamp: string;
    reason?: string;
  }[];
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
  filename: string;
  name?: string;
  displayName?: string;
  relativePath: string;
  absolutePath?: string;
  isDirectory: boolean;
  isSteering?: boolean;
  parentPath?: string;
  children?: Doc[];
  metadata?: {
    displayName?: string;
    icon?: string;
    color?: string;
    order?: number;
  };
}

export interface SteeringDoc {
  name: string;
  exists: boolean;
}

export interface Category {
  value: string;
  label: string;
  count: number;
}
