<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import type { Spec } from './types';

  const totalTasks = $derived(
    vscodeState.allSpecs.reduce((sum, s) => sum + (s.taskProgress?.total ?? 0), 0)
  );
  const completedTasks = $derived(
    vscodeState.allSpecs.reduce((sum, s) => sum + (s.taskProgress?.completed ?? 0), 0)
  );
  const overallProgress = $derived(
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  );

  const recentSpecs = $derived(
    [...vscodeState.activeSpecs]
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 5)
  );

  function dotClass(spec: Spec): string {
    const s = vscodeState.specStatus(spec);
    if (s === 'done') return 'dot-done';
    if (s === 'active') return 'dot-active';
    return 'dot-idle';
  }

  function statusLabel(spec: Spec): string {
    const s = vscodeState.specStatus(spec);
    if (s === 'done') return 'Completed';
    if (s === 'active') return 'In progress';
    return 'Not started';
  }

  function statusColor(spec: Spec): string {
    const s = vscodeState.specStatus(spec);
    if (s === 'done') return 'label-success';
    if (s === 'active') return 'label-primary';
    return 'label-muted';
  }

  // Pulse animation for active specs
  let pulseKey = $state(0);
  let pulseInterval: ReturnType<typeof setInterval>;
  $effect(() => {
    pulseInterval = setInterval(() => { pulseKey++; }, 2000);
    return () => clearInterval(pulseInterval);
  });
</script>

<div class="overview-tab">
  <!-- Section header -->
  <div class="section-header">
    <svg class="section-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
    <span>Project Overview</span>
  </div>

  <!-- Metrics card -->
  <div class="card metrics-card">
    <div class="metrics-grid">
      <button class="metric metric-clickable" type="button" onclick={() => vscodeState.setActiveTab('roadmap')}>
        <div class="metric-icon icon-primary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <span class="metric-label">Active</span>
        <span class="metric-value text-primary">{vscodeState.activeSpecs.length}</span>
      </button>

      <div class="metric">
        <div class="metric-icon icon-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        </div>
        <span class="metric-label">Archived</span>
        <span class="metric-value text-muted">{vscodeState.archivedSpecsList.length}</span>
      </div>

      <div class="metric">
        <div class="metric-icon icon-info">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <span class="metric-label">Total</span>
        <span class="metric-value text-info">{vscodeState.allSpecs.filter(s => !s.isEpic).length}</span>
      </div>

      <div class="metric">
        <div class="metric-icon icon-success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span class="metric-label">Tasks</span>
        <span class="metric-value text-success">{completedTasks}<span class="metric-sub">/{totalTasks}</span></span>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Overall Progress</span>
        <span class="progress-pct">{overallProgress}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: {overallProgress}%"></div>
      </div>
    </div>
  </div>

  <!-- Recent activity card -->
  <div class="card">
    <div class="card-header">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>Recent Activity</span>
    </div>

    <div class="activity-list">
      {#each recentSpecs as spec, i (spec.name)}
        <button
          class="activity-item"
          style="animation-delay: {i * 40}ms"
          type="button"
          onclick={() => vscodeState.openSpec(spec.name)}
        >
          <div class="activity-dot {dotClass(spec)}">
            {#if vscodeState.specStatus(spec) === 'active'}
              <div class="dot-pulse" key={pulseKey}></div>
            {/if}
          </div>
          <div class="activity-info">
            <span class="activity-name">{spec.displayName ?? spec.name}</span>
            <span class="activity-status {statusColor(spec)}">{statusLabel(spec)}</span>
          </div>
          <span class="activity-date">{vscodeState.formatDate(spec.lastModified)}</span>
          <svg class="activity-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      {/each}

      {#if recentSpecs.length === 0}
        <div class="empty-state">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p>No active specs yet.</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Epics summary -->
  {#if vscodeState.epics.length > 0}
    <div class="card">
      <div class="card-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        <span>Epics</span>
        <span class="count-badge">{vscodeState.epics.length}</span>
      </div>
      <div class="epics-list">
        {#each vscodeState.epics as epic (epic.name)}
          {@const childCount = vscodeState.allSpecs.filter(s => s.parentEpic === epic.name).length}
          {@const childDone = vscodeState.allSpecs.filter(s => s.parentEpic === epic.name && vscodeState.specStatus(s) === 'done').length}
          {@const epicProgress = childCount > 0 ? Math.round((childDone / childCount) * 100) : 0}
          <button class="epic-row" type="button" onclick={() => { vscodeState.openSpec(epic.name); vscodeState.setActiveTab('roadmap'); }}>
            <div class="epic-dot {dotClass(epic)}"></div>
            <div class="epic-info">
              <span class="epic-name">{epic.displayName ?? epic.name}</span>
              <div class="epic-meta">
                <span class="epic-children">{childDone}/{childCount} specs</span>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: {epicProgress}%"></div>
                </div>
              </div>
            </div>
            <svg class="epic-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .overview-tab {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    overflow-y: auto;
    height: 100%;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0 6px;
    color: #666;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .section-icon { color: #555; }

  .card {
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .card:hover {
    border-color: #383838;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px 8px;
    font-size: 10px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid #2a2a2a;
  }

  .count-badge {
    margin-left: auto;
    background: #2e2e2e;
    color: #4d9eff;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Metrics */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 14px 12px 12px;
    gap: 8px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .metric-clickable {
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    border-radius: 6px;
    transition: transform 0.15s;
  }

  .metric-clickable:hover {
    transform: scale(1.05);
  }

  .metric-clickable:active {
    transform: scale(0.97);
  }

  .metric-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s;
  }

  .icon-primary { background: rgba(77, 158, 255, 0.12); color: #4d9eff; }
  .icon-muted { background: rgba(102, 102, 102, 0.15); color: #666; }
  .icon-info { background: rgba(121, 192, 255, 0.12); color: #79c0ff; }
  .icon-success { background: rgba(63, 185, 80, 0.12); color: #3fb950; }

  .metric-label {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #555;
  }

  .metric-value {
    font-size: 22px;
    font-weight: 700;
    color: #e0e0e0;
    line-height: 1;
    font-family: 'JetBrains Mono', monospace;
  }

  .text-primary { color: #4d9eff; }
  .text-muted { color: #666; }
  .text-info { color: #79c0ff; }
  .text-success { color: #3fb950; }

  .metric-sub {
    font-size: 12px;
    color: #555;
    font-weight: 400;
  }

  /* Progress */
  .progress-section {
    padding: 0 14px 14px;
    border-top: 1px solid #2a2a2a;
    padding-top: 12px;
    margin-top: 4px;
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 7px;
  }

  .progress-label { font-size: 11px; color: #666; font-weight: 500; }
  .progress-pct { font-size: 11px; font-weight: 600; color: #4d9eff; font-family: 'JetBrains Mono', monospace; }

  .progress-track {
    height: 4px;
    background: #2e2e2e;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4d9eff, #79c0ff);
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Activity */
  .activity-list { display: flex; flex-direction: column; }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    background: none;
    border: none;
    border-top: 1px solid #2a2a2a;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, padding-left 0.15s;
    min-height: 44px;
    animation: fadeSlideIn 0.25s ease-out both;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .activity-item:first-child { border-top: none; }

  .activity-item:hover {
    background: #2a2a2a;
    padding-left: 18px;
  }

  .activity-item:active {
    background: #303030;
  }

  .activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
  }

  .dot-done { background: #3fb950; box-shadow: 0 0 6px rgba(63, 185, 80, 0.3); }
  .dot-active { background: #4d9eff; box-shadow: 0 0 6px rgba(77, 158, 255, 0.3); }
  .dot-idle { background: #444; }

  .dot-pulse {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1.5px solid #4d9eff;
    animation: dotPulse 2s ease-out infinite;
  }

  @keyframes dotPulse {
    0% { opacity: 0.6; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.8); }
  }

  .activity-info { flex: 1; min-width: 0; }

  .activity-name {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #c8c8c8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-status {
    display: block;
    font-size: 10px;
    margin-top: 1px;
  }

  .label-success { color: #3fb950; }
  .label-primary { color: #4d9eff; }
  .label-muted { color: #555; }

  .activity-date {
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }

  .activity-chevron {
    color: #444;
    flex-shrink: 0;
    transition: color 0.12s, transform 0.15s;
  }

  .activity-item:hover .activity-chevron {
    color: #4d9eff;
    transform: translateX(2px);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 14px;
    color: #444;
    text-align: center;
  }

  .empty-state p { font-size: 12px; color: #555; margin: 0; }

  /* Epics */
  .epics-list { display: flex; flex-direction: column; padding: 4px 0; }

  .epic-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    background: none;
    border: none;
    border-top: 1px solid #2a2a2a;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, padding-left 0.15s;
    width: 100%;
  }

  .epic-row:first-child { border-top: none; }

  .epic-row:hover {
    background: #2a2a2a;
    padding-left: 18px;
  }

  .epic-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .epic-dot.dot-done { background: #3fb950; }
  .epic-dot.dot-active { background: #4d9eff; }
  .epic-dot.dot-idle { background: #444; }

  .epic-info { flex: 1; min-width: 0; }

  .epic-name {
    display: block;
    font-size: 12px;
    color: #c0c0c0;
    font-weight: 500;
  }

  .epic-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 3px;
  }

  .epic-children {
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
  }

  .mini-progress {
    flex: 1;
    max-width: 60px;
    height: 2px;
    background: #2e2e2e;
    border-radius: 1px;
    overflow: hidden;
  }

  .mini-fill {
    height: 100%;
    background: #3fb950;
    border-radius: 1px;
    transition: width 0.4s ease;
  }

  .epic-chevron {
    color: #444;
    flex-shrink: 0;
    transition: color 0.12s, transform 0.15s;
  }

  .epic-row:hover .epic-chevron {
    color: #4d9eff;
    transform: translateX(2px);
  }
</style>
