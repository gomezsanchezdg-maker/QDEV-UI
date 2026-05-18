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
    if (s === 'done') return 'status-done';
    if (s === 'active') return 'status-active';
    return 'status-idle';
  }

  function statusLabel(spec: Spec): string {
    const s = vscodeState.specStatus(spec);
    if (s === 'done') return 'done';
    if (s === 'active') return 'in progress';
    return 'idle';
  }
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
  <div class="card">
    <div class="metrics-grid">
      <div class="metric">
        <div class="metric-icon primary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <span class="metric-label">Active</span>
        <span class="metric-value">{vscodeState.activeSpecs.length}</span>
      </div>

      <div class="metric">
        <div class="metric-icon muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        </div>
        <span class="metric-label">Archived</span>
        <span class="metric-value muted">{vscodeState.archivedSpecsList.length}</span>
      </div>

      <div class="metric">
        <div class="metric-icon info">
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
        <span class="metric-value info">{vscodeState.allSpecs.filter(s => !s.isEpic).length}</span>
      </div>

      <div class="metric">
        <div class="metric-icon success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span class="metric-label">Tasks</span>
        <span class="metric-value success">{completedTasks}<span class="metric-sub">/{totalTasks}</span></span>
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
      {#each recentSpecs as spec (spec.name)}
        <button
          class="activity-item"
          type="button"
          onclick={() => vscodeState.openSpec(spec.name)}
        >
          <div class="activity-dot {dotClass(spec)}"></div>
          <div class="activity-info">
            <span class="activity-name">{spec.displayName ?? spec.name}</span>
            <span class="activity-status">{statusLabel(spec)}</span>
          </div>
          <span class="activity-date">{vscodeState.formatDate(spec.lastModified)}</span>
        </button>
      {/each}

      {#if recentSpecs.length === 0}
        <div class="empty-state">No active specs yet.</div>
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
          <div class="epic-row">
            <div class="epic-dot {dotClass(epic)}"></div>
            <span class="epic-name">{epic.displayName ?? epic.name}</span>
            <span class="epic-children">{childCount} spec{childCount !== 1 ? 's' : ''}</span>
          </div>
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

  .section-icon {
    color: #555;
  }

  .card {
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 8px;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px 8px;
    font-size: 11px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid #2e2e2e;
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

  .metric-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .metric-icon.primary {
    background: rgba(77, 158, 255, 0.12);
    color: #4d9eff;
  }

  .metric-icon.muted {
    background: rgba(102, 102, 102, 0.15);
    color: #666;
  }

  .metric-icon.info {
    background: rgba(121, 192, 255, 0.12);
    color: #79c0ff;
  }

  .metric-icon.success {
    background: rgba(63, 185, 80, 0.12);
    color: #3fb950;
  }

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

  .metric-value.muted { color: #666; }
  .metric-value.info { color: #79c0ff; }
  .metric-value.success { color: #3fb950; }

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

  .progress-label {
    font-size: 11px;
    color: #666;
    font-weight: 500;
  }

  .progress-pct {
    font-size: 11px;
    font-weight: 600;
    color: #4d9eff;
    font-family: 'JetBrains Mono', monospace;
  }

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
    transition: width 0.4s ease;
  }

  /* Activity */
  .activity-list {
    display: flex;
    flex-direction: column;
  }

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
    transition: background 0.12s;
    min-height: 44px;
  }

  .activity-item:first-child {
    border-top: none;
  }

  .activity-item:hover {
    background: #2a2a2a;
  }

  .activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid transparent;
  }

  .status-done {
    background: #3fb950;
    border-color: rgba(63, 185, 80, 0.3);
  }

  .status-active {
    background: #4d9eff;
    border-color: rgba(77, 158, 255, 0.3);
  }

  .status-idle {
    background: transparent;
    border-color: #444;
  }

  .activity-info {
    flex: 1;
    min-width: 0;
  }

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
    color: #555;
    text-transform: capitalize;
    margin-top: 1px;
  }

  .activity-date {
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }

  .empty-state {
    padding: 16px 14px;
    font-size: 12px;
    color: #555;
    text-align: center;
  }

  /* Epics */
  .epics-list {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
  }

  .epic-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-top: 1px solid #2a2a2a;
  }

  .epic-row:first-child {
    border-top: none;
  }

  .epic-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
    border: 2px solid transparent;
  }

  .epic-name {
    flex: 1;
    font-size: 12px;
    color: #c0c0c0;
    font-weight: 500;
  }

  .epic-children {
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
  }
</style>
