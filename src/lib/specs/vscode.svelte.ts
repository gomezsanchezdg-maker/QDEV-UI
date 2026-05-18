import type { Spec, Approval, LogData, LogEntry, TaskData, Doc, SteeringDoc, Category } from './types';

const MOCK_SPECS: Spec[] = [
  {
    name: 'auth-system',
    displayName: 'Authentication System',
    isEpic: true,
    isArchived: false,
    order: 0,
    lastModified: '2026-05-17T14:32:00Z',
    startedAt: '2026-04-01T09:00:00Z',
    description: 'Full auth flow: login, registration, OAuth, session management.',
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: true, approved: true },
      tasks: { exists: true, approved: true },
    },
  },
  {
    name: 'oauth-integration',
    displayName: 'OAuth Integration',
    isEpic: false,
    isArchived: false,
    parentEpic: 'auth-system',
    order: 1,
    taskProgress: { total: 8, completed: 8, pending: 0 },
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: true, approved: true },
      tasks: { exists: true, approved: true },
    },
    startedAt: '2026-04-05T09:00:00Z',
    finishedAt: '2026-04-20T18:00:00Z',
    lastModified: '2026-04-20T18:00:00Z',
    description: 'GitHub and Google OAuth flows.',
  },
  {
    name: 'session-management',
    displayName: 'Session Management',
    isEpic: false,
    isArchived: false,
    parentEpic: 'auth-system',
    order: 2,
    taskProgress: { total: 6, completed: 4, pending: 2 },
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: true, approved: false },
      tasks: { exists: false, approved: false },
    },
    startedAt: '2026-04-21T09:00:00Z',
    lastModified: '2026-05-17T14:32:00Z',
    description: 'JWT tokens, refresh logic, revocation.',
  },
  {
    name: 'dashboard-v2',
    displayName: 'Dashboard V2',
    isEpic: false,
    isArchived: false,
    order: 3,
    taskProgress: { total: 12, completed: 3, pending: 9 },
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: true, approved: false },
      tasks: { exists: false, approved: false },
    },
    startedAt: '2026-05-01T09:00:00Z',
    lastModified: '2026-05-16T11:20:00Z',
    description: 'Redesign of the main dashboard with new charts.',
  },
  {
    name: 'api-gateway',
    displayName: 'API Gateway',
    isEpic: true,
    isArchived: false,
    order: 4,
    lastModified: '2026-05-14T09:10:00Z',
    startedAt: '2026-05-10T09:00:00Z',
    description: 'Central API gateway with rate limiting and routing.',
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: false, approved: false },
      tasks: { exists: false, approved: false },
    },
  },
  {
    name: 'rate-limiting',
    displayName: 'Rate Limiting',
    isEpic: false,
    isArchived: false,
    parentEpic: 'api-gateway',
    order: 5,
    taskProgress: { total: 4, completed: 1, pending: 3 },
    phases: {
      requirements: { exists: true, approved: false },
      design: { exists: false, approved: false },
      tasks: { exists: false, approved: false },
    },
    lastModified: '2026-05-14T09:10:00Z',
  },
  {
    name: 'legacy-import',
    displayName: 'Legacy Data Import',
    isEpic: false,
    isArchived: true,
    order: 6,
    taskProgress: { total: 10, completed: 10, pending: 0 },
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: true, approved: true },
      tasks: { exists: true, approved: true },
    },
    startedAt: '2026-02-01T09:00:00Z',
    finishedAt: '2026-03-15T17:00:00Z',
    lastModified: '2026-03-15T17:00:00Z',
    description: 'One-time migration from legacy database.',
  },
  {
    name: 'email-notifications',
    displayName: 'Email Notifications',
    isEpic: false,
    isArchived: false,
    order: 7,
    taskProgress: { total: 5, completed: 5, pending: 0 },
    phases: {
      requirements: { exists: true, approved: true },
      design: { exists: true, approved: true },
      tasks: { exists: true, approved: true },
    },
    startedAt: '2026-03-20T09:00:00Z',
    finishedAt: '2026-04-10T17:00:00Z',
    lastModified: '2026-05-15T08:45:00Z',
    description: 'Transactional emails via SendGrid.',
  },
];

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    taskId: 'TASK-001',
    timestamp: '2026-05-17T14:30:00Z',
    summary: 'Implemented JWT refresh token rotation with 7-day sliding window expiry.',
    filesModified: ['src/auth/tokenService.ts', 'src/middleware/authMiddleware.ts'],
    filesCreated: ['src/auth/refreshQueue.ts'],
  },
  {
    id: 'log-2',
    taskId: 'TASK-002',
    timestamp: '2026-05-16T11:15:00Z',
    summary: 'Added rate limiter middleware with Redis-backed sliding window algorithm.',
    filesModified: ['src/gateway/router.ts'],
    filesCreated: ['src/gateway/rateLimiter.ts', 'src/gateway/rateLimiter.test.ts'],
  },
  {
    id: 'log-3',
    taskId: 'TASK-003',
    timestamp: '2026-05-15T09:00:00Z',
    summary: 'Refactored dashboard metrics query to use materialized views for 10x perf.',
    filesModified: ['src/dashboard/metricsService.ts', 'src/dashboard/queries.sql', 'src/dashboard/MetricsCard.svelte'],
    filesCreated: [],
  },
  {
    id: 'log-4',
    taskId: 'TASK-004',
    timestamp: '2026-05-14T16:45:00Z',
    summary: 'Set up GitHub OAuth app and callback handler with PKCE flow.',
    filesModified: ['src/auth/oauthHandlers.ts'],
    filesCreated: ['src/auth/github.ts', 'src/auth/pkce.ts'],
  },
  {
    id: 'log-5',
    taskId: 'TASK-005',
    timestamp: '2026-05-13T13:20:00Z',
    summary: 'Configured email templates and SendGrid webhook verification.',
    filesModified: ['src/email/templates/welcome.html', 'src/email/sender.ts'],
    filesCreated: ['src/email/webhookHandler.ts'],
  },
];

const MOCK_STEERING_DOCS: SteeringDoc[] = [
  { name: 'product', exists: true },
  { name: 'tech', exists: true },
  { name: 'structure', exists: true },
  { name: 'branding', exists: false },
];

const MOCK_DOCS: Doc[] = [
  {
    filename: 'auth-system',
    relativePath: 'auth-system',
    isDirectory: true,
    children: [
      {
        filename: 'requirements.md',
        name: 'requirements',
        displayName: 'Requirements',
        relativePath: 'auth-system/requirements.md',
        parentPath: 'auth-system',
        isDirectory: false,
      },
      {
        filename: 'design.md',
        name: 'design',
        displayName: 'Design',
        relativePath: 'auth-system/design.md',
        parentPath: 'auth-system',
        isDirectory: false,
      },
      {
        filename: 'tasks.md',
        name: 'tasks',
        displayName: 'Tasks',
        relativePath: 'auth-system/tasks.md',
        parentPath: 'auth-system',
        isDirectory: false,
      },
    ],
  },
  {
    filename: 'dashboard-v2',
    relativePath: 'dashboard-v2',
    isDirectory: true,
    children: [
      {
        filename: 'requirements.md',
        name: 'requirements',
        displayName: 'Requirements',
        relativePath: 'dashboard-v2/requirements.md',
        parentPath: 'dashboard-v2',
        isDirectory: false,
      },
      {
        filename: 'design.md',
        name: 'design',
        displayName: 'Design',
        relativePath: 'dashboard-v2/design.md',
        parentPath: 'dashboard-v2',
        isDirectory: false,
      },
    ],
  },
  {
    filename: 'api-gateway',
    relativePath: 'api-gateway',
    isDirectory: true,
    children: [
      {
        filename: 'requirements.md',
        name: 'requirements',
        displayName: 'Requirements',
        relativePath: 'api-gateway/requirements.md',
        parentPath: 'api-gateway',
        isDirectory: false,
      },
    ],
  },
  {
    filename: 'README.md',
    name: 'README',
    displayName: 'README',
    relativePath: 'README.md',
    isDirectory: false,
  },
];

const MOCK_APPROVALS: Approval[] = [
  {
    id: 'apr-1',
    title: 'Session Management — Design Document',
    filePath: 'session-management/design.md',
    status: 'pending',
    type: 'document',
    category: 'spec',
    categoryName: 'session-management',
    createdAt: '2026-05-17T10:00:00Z',
    description: 'Review the JWT session management design including refresh token rotation and revocation strategy.',
  },
  {
    id: 'apr-2',
    title: 'Dashboard V2 — Design Document',
    filePath: 'dashboard-v2/design.md',
    status: 'pending',
    type: 'document',
    category: 'spec',
    categoryName: 'dashboard-v2',
    createdAt: '2026-05-16T14:30:00Z',
    description: 'New dashboard layout with real-time metrics, chart components, and filter system.',
  },
  {
    id: 'apr-3',
    title: 'Rate Limiting — Requirements',
    filePath: 'rate-limiting/requirements.md',
    status: 'pending',
    type: 'document',
    category: 'spec',
    categoryName: 'rate-limiting',
    createdAt: '2026-05-15T09:00:00Z',
    description: 'Requirements for the API rate limiting feature: sliding window, per-user quotas, and burst handling.',
  },
  {
    id: 'apr-4',
    title: 'Product Steering Update',
    filePath: '.cursor/steering/product.md',
    status: 'pending',
    type: 'document',
    category: 'steering',
    categoryName: 'steering',
    createdAt: '2026-05-14T11:00:00Z',
    description: 'Updated product steering doc with new target audience and feature priorities.',
  },
  {
    id: 'apr-5',
    title: 'API Gateway — Requirements',
    filePath: 'api-gateway/requirements.md',
    status: 'needs-revision',
    type: 'document',
    category: 'spec',
    categoryName: 'api-gateway',
    createdAt: '2026-05-13T16:00:00Z',
    respondedAt: '2026-05-14T09:00:00Z',
    response: 'needs-revision',
    description: 'Gateway requirements need more detail on authentication middleware chain and error handling.',
  },
];

function createVscodeState() {
  let specs = $state<Spec[]>(MOCK_SPECS.filter(s => !s.isArchived));
  let archivedSpecsList = $state<Spec[]>(MOCK_SPECS.filter(s => s.isArchived));
  let approvals = $state<Approval[]>(MOCK_APPROVALS);
  let tasks = $state<TaskData | null>(null);
  let docs = $state<Doc[]>(MOCK_DOCS);
  let logs = $state<LogData | null>(null);
  let steeringDocs = $state<SteeringDoc[]>(MOCK_STEERING_DOCS);
  let approvalCategories = $state<Category[]>([
    { value: 'all', label: 'All', count: MOCK_APPROVALS.filter(a => a.status === 'pending').length },
    { value: 'steering', label: 'Steering', count: MOCK_APPROVALS.filter(a => a.category === 'steering' && a.status === 'pending').length },
    { value: 'session-management', label: 'Session Mgmt', count: MOCK_APPROVALS.filter(a => a.categoryName === 'session-management' && a.status === 'pending').length },
    { value: 'dashboard-v2', label: 'Dashboard V2', count: MOCK_APPROVALS.filter(a => a.categoryName === 'dashboard-v2' && a.status === 'pending').length },
    { value: 'rate-limiting', label: 'Rate Limiting', count: MOCK_APPROVALS.filter(a => a.categoryName === 'rate-limiting' && a.status === 'pending').length },
    { value: 'api-gateway', label: 'API Gateway', count: MOCK_APPROVALS.filter(a => a.categoryName === 'api-gateway' && a.status === 'pending').length },
  ]);

  let activeTab = $state<'overview' | 'roadmap' | 'docs' | 'notifications' | 'logs'>('overview');
  let selectedSpec = $state<string>('');
  let activeRoadmapFilter = $state<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  let selectedApprovalCategory = $state<string>('all');
  let openFolders = $state<string[]>(['auth-system']);
  let docsSearchResults = $state<Doc[] | null>(null);

  const allSpecs = $derived([...specs, ...archivedSpecsList]);
  const activeSpecs = $derived(specs.filter(s => !s.isEpic));
  const epics = $derived(allSpecs.filter(s => s.isEpic));

  const filteredApprovals = $derived(
    selectedApprovalCategory === 'all'
      ? approvals
      : approvals.filter(a => a.categoryName === selectedApprovalCategory || a.category === selectedApprovalCategory)
  );

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function specStatus(spec: Spec): 'idle' | 'active' | 'done' {
    if (spec.finishedAt) return 'done';
    if (spec.startedAt) return 'active';
    return 'idle';
  }

  function getSpecProgress(spec: Spec): number {
    if (!spec.taskProgress || spec.taskProgress.total === 0) return 0;
    return Math.round((spec.taskProgress.completed / spec.taskProgress.total) * 100);
  }

  function openSpec(name: string) {
    selectedSpec = name;
  }

  function loadLogs(specName: string) {
    const entries = specName
      ? MOCK_LOGS.filter((_, i) => i < 3)
      : MOCK_LOGS;
    logs = {
      specName,
      entries,
      stats: {
        totalEntries: entries.length,
        totalFilesChanged: entries.reduce(
          (sum, e) => sum + e.filesModified.length + e.filesCreated.length, 0
        ),
      },
    };
  }

  function toggleFolder(path: string) {
    if (openFolders.includes(path)) {
      openFolders = openFolders.filter(p => p !== path);
    } else {
      openFolders = [...openFolders, path];
    }
  }

  function setDocsSearchResults(results: Doc[] | null) {
    docsSearchResults = results;
  }

  function setApprovalCategory(cat: string) {
    selectedApprovalCategory = cat;
  }

  function respondApproval(id: string, response: 'approved' | 'rejected' | 'needs-revision') {
    approvals = approvals.map(a =>
      a.id === id
        ? { ...a, status: response, respondedAt: new Date().toISOString(), response }
        : a
    );
  }

  function batchRespondApprovals(ids: string[], response: 'approved' | 'rejected' | 'needs-revision') {
    const now = new Date().toISOString();
    approvals = approvals.map(a =>
      ids.includes(a.id)
        ? { ...a, status: response, respondedAt: now, response }
        : a
    );
  }

  return {
    get specs() { return specs; },
    get archivedSpecsList() { return archivedSpecsList; },
    get approvals() { return approvals; },
    get tasks() { return tasks; },
    get docs() { return docs; },
    get logs() { return logs; },
    get steeringDocs() { return steeringDocs; },
    get approvalCategories() { return approvalCategories; },
    get activeTab() { return activeTab; },
    get selectedSpec() { return selectedSpec; },
    get activeRoadmapFilter() { return activeRoadmapFilter; },
    get selectedApprovalCategory() { return selectedApprovalCategory; },
    get openFolders() { return openFolders; },
    get docsSearchResults() { return docsSearchResults; },
    get allSpecs() { return allSpecs; },
    get activeSpecs() { return activeSpecs; },
    get epics() { return epics; },
    get filteredApprovals() { return filteredApprovals; },

    setActiveTab(tab: typeof activeTab) { activeTab = tab; },
    setSelectedSpec(name: string) { selectedSpec = name; },
    setActiveRoadmapFilter(f: 'ACTIVE' | 'ARCHIVED') { activeRoadmapFilter = f; },
    setApprovalCategory(cat: string) { selectedApprovalCategory = cat; },
    formatDate,
    specStatus,
    getSpecProgress,
    openSpec,
    loadLogs,
    toggleFolder,
    setDocsSearchResults,
    respondApproval,
    batchRespondApprovals,
  };
}

export const vscodeState = createVscodeState();
