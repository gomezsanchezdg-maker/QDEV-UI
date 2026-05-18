<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import OverviewTab from './OverviewTab.svelte';
  import RoadmapTab from './RoadmapTab.svelte';
  import LogsTab from './LogsTab.svelte';

  type Tab = 'overview' | 'roadmap' | 'logs';
  let activeTab = $state<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: `<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>`,
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      icon: `<polygon points="3 11 22 2 13 21 11 13 3 11"/>`,
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
    },
  ];
</script>

<div class="specs-shell">
  <!-- Sidebar header -->
  <div class="specs-header">
    <div class="header-brand">
      <div class="brand-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      </div>
      <span class="brand-name">Spec Workflow</span>
    </div>
    <div class="header-actions">
      <button class="header-btn" type="button" title="New spec">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <button class="header-btn" type="button" title="Settings">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Tab bar -->
  <div class="tab-bar">
    {#each tabs as tab}
      <button
        class="tab-btn {activeTab === tab.id ? 'tab-active' : ''}"
        type="button"
        onclick={() => { activeTab = tab.id; }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {@html tab.icon}
        </svg>
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Tab content -->
  <div class="tab-content">
    {#if activeTab === 'overview'}
      <OverviewTab />
    {:else if activeTab === 'roadmap'}
      <RoadmapTab />
    {:else if activeTab === 'logs'}
      <LogsTab />
    {/if}
  </div>
</div>

<style>
  .specs-shell {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #1e1e1e;
    overflow: hidden;
  }

  /* Header */
  .specs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 38px;
    padding: 0 12px 0 14px;
    background: #1a1a1a;
    border-bottom: 1px solid #2e2e2e;
    flex-shrink: 0;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .brand-icon {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: #1a3a5e;
    border: 1px solid #2a5080;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4d9eff;
  }

  .brand-name {
    font-size: 12px;
    font-weight: 600;
    color: #c0c0c0;
    letter-spacing: 0.01em;
  }

  .header-actions {
    display: flex;
    gap: 2px;
  }

  .header-btn {
    width: 26px;
    height: 26px;
    border-radius: 5px;
    border: none;
    background: none;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }

  .header-btn:hover {
    background: #2a2a2a;
    color: #a0a0a0;
  }

  /* Tab bar */
  .tab-bar {
    display: flex;
    background: #1a1a1a;
    border-bottom: 1px solid #2e2e2e;
    height: 36px;
    flex-shrink: 0;
    padding: 0 6px;
    gap: 2px;
    align-items: center;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    height: 100%;
    border: none;
    background: none;
    color: #555;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s;
    position: relative;
    top: 1px;
  }

  .tab-btn:hover:not(.tab-active) {
    color: #a0a0a0;
  }

  .tab-btn.tab-active {
    color: #e0e0e0;
    border-bottom-color: #4d9eff;
  }

  /* Content */
  .tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
