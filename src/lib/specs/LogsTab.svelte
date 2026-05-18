<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import type { LogEntry } from './types';

  let searchQuery = $state('');
  let expandedEntries = $state<Set<string>>(new Set());
  let searchTimeout: ReturnType<typeof setTimeout>;

  function onSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = val;
    }, 300);
  }

  function onSpecChange(e: Event) {
    const specName = (e.target as HTMLSelectElement).value;
    vscodeState.setSelectedSpec(specName);
    vscodeState.loadLogs(specName);
  }

  function toggleEntry(id: string) {
    const next = new Set(expandedEntries);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedEntries = next;
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const filteredEntries = $derived.by(() => {
    const entries = vscodeState.logs?.entries ?? [];
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.summary.toLowerCase().includes(q) ||
      e.taskId.toLowerCase().includes(q) ||
      e.filesModified.some(f => f.toLowerCase().includes(q)) ||
      e.filesCreated.some(f => f.toLowerCase().includes(q))
    );
  });

  // Load logs on mount if not loaded
  $effect(() => {
    if (!vscodeState.logs) {
      vscodeState.loadLogs(vscodeState.selectedSpec);
    }
  });
</script>

<div class="logs-tab">
  <!-- Toolbar -->
  <div class="logs-toolbar">
    <div class="search-wrap">
      <svg class="search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        class="search-input"
        type="text"
        placeholder="Search logs..."
        oninput={onSearchInput}
      />
    </div>

    <select class="spec-select" value={vscodeState.selectedSpec} onchange={onSpecChange}>
      <option value="">All specs</option>
      {#each vscodeState.allSpecs.filter(s => !s.isEpic) as spec (spec.name)}
        <option value={spec.name}>{spec.displayName ?? spec.name}</option>
      {/each}
    </select>
  </div>

  <!-- Stats -->
  {#if vscodeState.logs?.stats}
    {@const stats = vscodeState.logs.stats}
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-num">{stats.totalEntries}</span>
        <span class="stat-label">Logs</span>
      </div>
      <div class="stat-card">
        <span class="stat-num accent">+{stats.totalFilesChanged}</span>
        <span class="stat-label">Files changed</span>
      </div>
      <div class="stat-card">
        <span class="stat-num success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          OK
        </span>
        <span class="stat-label">Status</span>
      </div>
    </div>
  {/if}

  <!-- Entries -->
  <div class="entries-list">
    {#if filteredEntries.length === 0 && !vscodeState.logs}
      <div class="empty-state">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>Select a spec to view logs.</p>
      </div>
    {:else if filteredEntries.length === 0}
      <div class="empty-state">
        <p>No logs match your search.</p>
      </div>
    {:else}
      {#each filteredEntries as entry (entry.id)}
        {@const isExpanded = expandedEntries.has(entry.id)}
        {@const fileCount = entry.filesModified.length + entry.filesCreated.length}
        <div class="entry-card {isExpanded ? 'entry-expanded' : ''}">
          <button
            class="entry-header"
            type="button"
            onclick={() => toggleEntry(entry.id)}
          >
            <div class="entry-badges">
              <span class="task-badge">{entry.taskId}</span>
              {#if vscodeState.logs?.specName}
                <span class="spec-badge">{vscodeState.logs.specName}</span>
              {/if}
            </div>
            <span class="entry-time">{formatDateTime(entry.timestamp)}</span>
            <span class="file-count">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
            <svg
              class="entry-chevron {isExpanded ? 'chevron-open' : ''}"
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <p class="entry-summary">{entry.summary}</p>

          {#if isExpanded}
            <div class="entry-details">
              {#if entry.filesModified.length > 0}
                <div class="files-section">
                  <div class="files-label">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modified
                  </div>
                  <div class="files-list">
                    {#each entry.filesModified as file}
                      <span class="file-chip modified">{file}</span>
                    {/each}
                  </div>
                </div>
              {/if}

              {#if entry.filesCreated.length > 0}
                <div class="files-section">
                  <div class="files-label">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    Created
                  </div>
                  <div class="files-list">
                    {#each entry.filesCreated as file}
                      <span class="file-chip created">{file}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .logs-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Toolbar */
  .logs-toolbar {
    display: flex;
    gap: 8px;
    padding: 10px 12px 8px;
    border-bottom: 1px solid #2e2e2e;
    flex-shrink: 0;
  }

  .search-wrap {
    position: relative;
    flex: 1;
  }

  .search-icon {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    padding: 5px 8px 5px 26px;
    font-size: 12px;
    color: #d0d0d0;
    outline: none;
    transition: border-color 0.15s;
    font-family: 'Inter', sans-serif;
  }

  .search-input::placeholder {
    color: #444;
  }

  .search-input:focus {
    border-color: #4d9eff;
  }

  .spec-select {
    background: #1a1a1a;
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 12px;
    color: #888;
    outline: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.15s;
    max-width: 130px;
    appearance: none;
  }

  .spec-select:focus {
    border-color: #4d9eff;
  }

  .spec-select option {
    background: #252525;
    color: #e0e0e0;
  }

  /* Stats */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #2e2e2e;
    border-bottom: 1px solid #2e2e2e;
    flex-shrink: 0;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 8px;
    background: #1e1e1e;
    gap: 3px;
  }

  .stat-num {
    font-size: 18px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: #c8c8c8;
    display: flex;
    align-items: center;
    gap: 3px;
    line-height: 1;
  }

  .stat-num.accent { color: #4d9eff; }
  .stat-num.success { color: #3fb950; font-size: 14px; }

  .stat-label {
    font-size: 10px;
    color: #555;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Entries */
  .entries-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .entry-card {
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 7px;
    overflow: hidden;
    transition: border-color 0.15s;
  }

  .entry-card:hover {
    border-color: #3a3a3a;
  }

  .entry-expanded {
    border-color: #383838;
  }

  .entry-header {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 8px 10px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
  }

  .entry-header:hover {
    background: #2a2a2a;
  }

  .entry-badges {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .task-badge {
    background: #1a3a5e;
    border: 1px solid #2a5080;
    color: #4d9eff;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
  }

  .spec-badge {
    background: #1e2a38;
    border: 1px solid #2a3a50;
    color: #79c0ff;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    padding: 1px 5px;
    border-radius: 4px;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entry-time {
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
    flex: 1;
    text-align: right;
  }

  .file-count {
    font-size: 10px;
    color: #555;
    flex-shrink: 0;
  }

  .entry-chevron {
    color: #555;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .chevron-open {
    transform: rotate(90deg);
  }

  .entry-summary {
    font-size: 12px;
    color: #b0b0b0;
    line-height: 1.5;
    padding: 0 10px 8px;
    margin: 0;
    border-top: 1px solid #2a2a2a;
  }

  /* Details */
  .entry-details {
    border-top: 1px solid #2a2a2a;
    padding: 8px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: slideDown 0.15s ease-out;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .files-section {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .files-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .files-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .file-chip {
    display: block;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid transparent;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-chip.modified {
    background: rgba(210, 153, 34, 0.08);
    border-color: rgba(210, 153, 34, 0.2);
    color: #c8a840;
  }

  .file-chip.created {
    background: rgba(63, 185, 80, 0.08);
    border-color: rgba(63, 185, 80, 0.2);
    color: #3fb950;
  }

  /* Empty */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 48px 16px;
    color: #444;
    text-align: center;
  }

  .empty-state p {
    font-size: 12px;
    color: #555;
    margin: 0;
  }
</style>
