<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import type { Spec } from './types';

  let openEpics = $state<Set<string>>(new Set(['auth-system']));

  function toggleEpic(name: string) {
    const next = new Set(openEpics);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    openEpics = next;
  }

  const filteredSpecs = $derived(
    vscodeState.activeRoadmapFilter === 'ACTIVE'
      ? vscodeState.allSpecs.filter(s => !s.isArchived)
      : vscodeState.allSpecs.filter(s => s.isArchived)
  );

  const topLevelItems = $derived(
    filteredSpecs.filter(s => !s.parentEpic).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  function childrenOf(epicName: string): Spec[] {
    return filteredSpecs
      .filter(s => s.parentEpic === epicName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  function dotClass(spec: Spec, large = false): string {
    const s = vscodeState.specStatus(spec);
    const base = large ? 'epic-dot' : 'spec-dot';
    if (s === 'done') return `${base} dot-done`;
    if (s === 'active') return `${base} dot-active`;
    return `${base} dot-idle`;
  }

  function phaseIcon(type: 'requirements' | 'design' | 'tasks') {
    if (type === 'requirements') return `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`;
    if (type === 'design') return `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 5 5m-5 0 5-5"/>`;
    return `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`;
  }

  function phaseLabel(type: 'requirements' | 'design' | 'tasks') {
    if (type === 'requirements') return 'REQ';
    if (type === 'design') return 'DES';
    return 'TSK';
  }
</script>

<div class="roadmap-tab">
  <!-- Header -->
  <div class="roadmap-header">
    <div class="header-title">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
      <span>Roadmap</span>
    </div>
    <div class="filter-toggle">
      <button
        class="toggle-btn {vscodeState.activeRoadmapFilter === 'ACTIVE' ? 'toggle-active' : ''}"
        type="button"
        onclick={() => vscodeState.setActiveRoadmapFilter('ACTIVE')}
      >Active</button>
      <button
        class="toggle-btn {vscodeState.activeRoadmapFilter === 'ARCHIVED' ? 'toggle-active' : ''}"
        type="button"
        onclick={() => vscodeState.setActiveRoadmapFilter('ARCHIVED')}
      >Archived</button>
    </div>
  </div>

  <!-- Timeline -->
  <div class="timeline">
    {#each topLevelItems as item (item.name)}
      {#if item.isEpic}
        <!-- Epic row -->
        <div class="timeline-item">
          <div class="timeline-left">
            <div class="{dotClass(item, true)}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div class="timeline-line"></div>
          </div>
          <div class="timeline-content">
            <button
              class="epic-header"
              type="button"
              onclick={() => toggleEpic(item.name)}
            >
              <svg
                class="chevron {openEpics.has(item.name) ? 'chevron-open' : ''}"
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span class="epic-name">{item.displayName ?? item.name}</span>
              <span class="epic-badge">{childrenOf(item.name).length}</span>
              {#if item.startedAt}
                <span class="epic-date">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {vscodeState.formatDate(item.startedAt)}
                </span>
              {/if}
            </button>

            {#if openEpics.has(item.name)}
              <div class="epic-children">
                {#each childrenOf(item.name) as child (child.name)}
                  <div class="child-item">
                    <div class="child-left">
                      <div class="{dotClass(child)}"></div>
                    </div>
                    <div class="child-content">
                      <div class="spec-row">
                        <button
                          class="spec-name"
                          type="button"
                          onclick={() => vscodeState.openSpec(child.name)}
                        >
                          {child.displayName ?? child.name}
                        </button>
                        {#if child.taskProgress}
                          <span class="task-count">{child.taskProgress.completed}/{child.taskProgress.total}</span>
                        {/if}
                      </div>
                      {#if child.description}
                        <p class="spec-desc">{child.description}</p>
                      {/if}
                      <div class="spec-footer">
                        {#if child.startedAt}
                          <span class="spec-date">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {vscodeState.formatDate(child.startedAt)}
                          </span>
                        {/if}
                        <div class="phase-btns">
                          {#each (['requirements', 'design', 'tasks'] as const) as phaseType}
                            {@const phase = child.phases[phaseType]}
                            <button
                              class="phase-btn {phase.exists ? 'phase-exists' : 'phase-empty'} {phase.approved ? 'phase-approved' : ''}"
                              type="button"
                              disabled={!phase.exists}
                              title="{phaseType} {phase.approved ? '(approved)' : phase.exists ? '(pending)' : '(not started)'}"
                            >
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                {@html phaseIcon(phaseType)}
                              </svg>
                              {phaseLabel(phaseType)}
                              {#if phase.approved}
                                <svg class="phase-check" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              {/if}
                            </button>
                          {/each}
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else if !item.parentEpic}
        <!-- Standalone spec -->
        <div class="timeline-item">
          <div class="timeline-left">
            <div class="{dotClass(item)}"></div>
            <div class="timeline-line"></div>
          </div>
          <div class="timeline-content standalone">
            <div class="spec-row">
              <button
                class="spec-name"
                type="button"
                onclick={() => vscodeState.openSpec(item.name)}
              >
                {item.displayName ?? item.name}
              </button>
              {#if item.taskProgress}
                <span class="task-count">{item.taskProgress.completed}/{item.taskProgress.total}</span>
              {/if}
            </div>
            {#if item.description}
              <p class="spec-desc">{item.description}</p>
            {/if}
            <div class="spec-footer">
              {#if item.startedAt}
                <span class="spec-date">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {vscodeState.formatDate(item.startedAt)}
                </span>
              {/if}
              <div class="phase-btns">
                {#each (['requirements', 'design', 'tasks'] as const) as phaseType}
                  {@const phase = item.phases[phaseType]}
                  <button
                    class="phase-btn {phase.exists ? 'phase-exists' : 'phase-empty'} {phase.approved ? 'phase-approved' : ''}"
                    type="button"
                    disabled={!phase.exists}
                    title="{phaseType}"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      {@html phaseIcon(phaseType)}
                    </svg>
                    {phaseLabel(phaseType)}
                    {#if phase.approved}
                      <svg class="phase-check" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if topLevelItems.length === 0}
      <div class="empty-roadmap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        <p>No {vscodeState.activeRoadmapFilter.toLowerCase()} specs.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .roadmap-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .roadmap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px 8px;
    border-bottom: 1px solid #2e2e2e;
    flex-shrink: 0;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .filter-toggle {
    display: flex;
    background: #1a1a1a;
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
  }

  .toggle-btn {
    padding: 3px 9px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #555;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn:hover:not(.toggle-active) {
    color: #a0a0a0;
    background: #252525;
  }

  .toggle-btn.toggle-active {
    background: #252525;
    color: #e0e0e0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  /* Timeline */
  .timeline {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 20px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .timeline-item {
    display: flex;
    gap: 10px;
    min-height: 32px;
  }

  .timeline-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 20px;
  }

  .timeline-line {
    flex: 1;
    width: 1px;
    background: #2e2e2e;
    margin-top: 4px;
    min-height: 8px;
  }

  .timeline-content {
    flex: 1;
    min-width: 0;
    padding-bottom: 12px;
  }

  .timeline-content.standalone {
    padding: 2px 0 12px;
  }

  /* Dots */
  .epic-dot {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .spec-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid transparent;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .dot-done {
    background: rgba(63, 185, 80, 0.15);
    border-color: #3fb950;
    color: #3fb950;
  }

  .spec-dot.dot-done {
    background: #3fb950;
    border-color: rgba(63, 185, 80, 0.4);
  }

  .dot-active {
    background: rgba(77, 158, 255, 0.15);
    border-color: #4d9eff;
    color: #4d9eff;
  }

  .spec-dot.dot-active {
    background: #4d9eff;
    border-color: rgba(77, 158, 255, 0.4);
  }

  .dot-idle {
    background: #252525;
    border-color: #383838;
    color: #555;
  }

  .spec-dot.dot-idle {
    background: transparent;
    border-color: #444;
  }

  /* Epic header */
  .epic-header {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    background: none;
    border: none;
    padding: 2px 0 6px;
    cursor: pointer;
    text-align: left;
  }

  .chevron {
    color: #555;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .chevron-open {
    transform: rotate(90deg);
  }

  .epic-name {
    font-size: 13px;
    font-weight: 600;
    color: #d0d0d0;
    flex: 1;
  }

  .epic-badge {
    background: #2e2e2e;
    color: #666;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    padding: 1px 5px;
    border-radius: 8px;
    font-weight: 500;
  }

  .epic-date {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Children */
  .epic-children {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-left: 8px;
    border-left: 2px solid #2e2e2e;
    margin-left: 4px;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .child-item {
    display: flex;
    gap: 8px;
    padding: 6px 0;
  }

  .child-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 12px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  .child-content {
    flex: 1;
    min-width: 0;
  }

  /* Spec rows */
  .spec-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .spec-name {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    font-weight: 600;
    color: #c0c0c0;
    cursor: pointer;
    text-align: left;
    transition: color 0.12s;
  }

  .spec-name:hover {
    color: #4d9eff;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .task-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #555;
    background: #1e1e1e;
    border: 1px solid #2e2e2e;
    padding: 1px 5px;
    border-radius: 4px;
  }

  .spec-desc {
    font-size: 11px;
    color: #555;
    margin: 3px 0 4px;
    line-height: 1.4;
  }

  .spec-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .spec-date {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #555;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Phase buttons */
  .phase-btns {
    display: flex;
    gap: 4px;
  }

  .phase-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.12s;
    min-height: 22px;
    letter-spacing: 0.02em;
  }

  .phase-empty {
    background: #1e1e1e;
    border-color: #2a2a2a;
    color: #444;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .phase-exists {
    background: #1e2a38;
    border-color: #2a3a50;
    color: #4d9eff;
  }

  .phase-exists:hover {
    background: #243040;
    border-color: #3a5070;
  }

  .phase-approved {
    background: rgba(63, 185, 80, 0.1);
    border-color: rgba(63, 185, 80, 0.3);
    color: #3fb950;
  }

  .phase-approved:hover {
    background: rgba(63, 185, 80, 0.15);
  }

  .phase-check {
    color: #3fb950;
  }

  /* Empty state */
  .empty-roadmap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 48px 16px;
    color: #444;
  }

  .empty-roadmap p {
    font-size: 12px;
    color: #555;
    margin: 0;
  }
</style>
