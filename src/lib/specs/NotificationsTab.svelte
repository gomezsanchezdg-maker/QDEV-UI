<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import type { Approval } from './types';

  let selectionMode = $state(false);
  let selectedApprovals = $state(new Set<string>());
  let processingApproval = $state<string | null>(null);
  let batchProcessing = $state(false);
  let hoveredCard = $state<string | null>(null);

  const pendingApprovals = $derived(
    vscodeState.filteredApprovals.filter(a => a.status === 'pending' || a.status === 'needs-revision')
  );

  const pendingCount = $derived(
    vscodeState.approvals.filter(a => a.status === 'pending').length
  );

  function toggleSelectionMode() {
    selectionMode = !selectionMode;
    if (!selectionMode) selectedApprovals = new Set();
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedApprovals);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selectedApprovals = next;
  }

  function selectAll() {
    if (selectedApprovals.size === pendingApprovals.length) {
      selectedApprovals = new Set();
    } else {
      selectedApprovals = new Set(pendingApprovals.map(a => a.id));
    }
  }

  function clearSelection() {
    selectedApprovals = new Set();
  }

  async function handleApprove(id: string) {
    processingApproval = id;
    await new Promise(r => setTimeout(r, 400));
    vscodeState.respondApproval(id, 'approved');
    processingApproval = null;
  }

  async function handleRevise(id: string) {
    processingApproval = id;
    await new Promise(r => setTimeout(r, 400));
    vscodeState.respondApproval(id, 'needs-revision');
    processingApproval = null;
  }

  async function handleReject(id: string) {
    processingApproval = id;
    await new Promise(r => setTimeout(r, 400));
    vscodeState.respondApproval(id, 'rejected');
    processingApproval = null;
  }

  async function handleBatchAction(action: 'approved' | 'needs-revision' | 'rejected') {
    batchProcessing = true;
    await new Promise(r => setTimeout(r, 600));
    vscodeState.batchRespondApprovals(Array.from(selectedApprovals), action);
    selectedApprovals = new Set();
    batchProcessing = false;
    selectionMode = false;
  }

  function statusBadgeClass(status: Approval['status']): string {
    if (status === 'pending') return 'badge-pending';
    if (status === 'needs-revision') return 'badge-revision';
    if (status === 'approved') return 'badge-approved';
    return 'badge-rejected';
  }

  function statusLabel(status: Approval['status']): string {
    if (status === 'needs-revision') return 'REVISION';
    if (status === 'approved') return 'APPROVED';
    if (status === 'rejected') return 'REJECTED';
    return 'PENDING';
  }

  function cardBorderClass(status: Approval['status']): string {
    if (status === 'pending') return 'border-pending';
    if (status === 'needs-revision') return 'border-revision';
    return 'border-default';
  }
</script>

<div class="notifications-tab">
  <!-- Category filter -->
  <div class="category-bar">
    {#each vscodeState.approvalCategories as cat (cat.value)}
      <button
        class="category-pill {vscodeState.selectedApprovalCategory === cat.value ? 'pill-active' : ''}"
        type="button"
        onclick={() => vscodeState.setApprovalCategory(cat.value)}
      >
        {cat.label}
        {#if cat.count > 0}
          <span class="pill-count">{cat.count}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <div class="toolbar-left">
      {#if selectionMode && pendingApprovals.length > 0}
        <button class="checkbox-btn" type="button" onclick={selectAll}>
          <div class="checkbox {selectedApprovals.size === pendingApprovals.length && pendingApprovals.length > 0 ? 'checkbox-checked' : ''}">
            {#if selectedApprovals.size === pendingApprovals.length && pendingApprovals.length > 0}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            {/if}
          </div>
        </button>
        {#if selectedApprovals.size > 0}
          <span class="selected-count">{selectedApprovals.size} selected</span>
        {/if}
      {/if}
    </div>
    <div class="toolbar-center">
      <span class="pending-label">{pendingCount} pending review{pendingCount !== 1 ? 's' : ''}</span>
    </div>
    <div class="toolbar-right">
      <button class="mode-btn" type="button" onclick={toggleSelectionMode}>
        {selectionMode ? 'Cancel' : 'Select Mode'}
      </button>
    </div>
  </div>

  <!-- Approval list -->
  <div class="approvals-scroll">
    {#if pendingApprovals.length === 0}
      <div class="empty-state">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>No pending reviews found in this category.</p>
      </div>
    {:else}
      <div class="approvals-list">
        {#each pendingApprovals as approval, i (approval.id)}
          {@const isSelected = selectedApprovals.has(approval.id)}
          {@const isProcessing = processingApproval === approval.id}
          {@const isHovered = hoveredCard === approval.id}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="approval-card {isSelected ? 'card-selected' : ''} {isHovered ? 'card-hovered' : ''}"
            style="animation-delay: {i * 30}ms"
            onmouseenter={() => hoveredCard = approval.id}
            onmouseleave={() => hoveredCard = null}
          >
            <div class="card-accent {cardBorderClass(approval.status)} {isSelected ? 'accent-selected' : ''}"></div>
            <div class="card-content">
              <!-- Selection checkbox -->
              {#if selectionMode}
                <button class="card-checkbox-btn" type="button" onclick={() => toggleSelect(approval.id)}>
                  <div class="checkbox {isSelected ? 'checkbox-checked' : ''}">
                    {#if isSelected}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    {/if}
                  </div>
                </button>
              {/if}

              <!-- Title row -->
              <div class="card-header">
                <span class="card-title">{approval.title}</span>
                <span class="status-badge {statusBadgeClass(approval.status)}">{statusLabel(approval.status)}</span>
              </div>

              <!-- Description -->
              {#if approval.description}
                <p class="card-desc">{approval.description}</p>
              {/if}

              <!-- File path -->
              <div class="file-path">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>{approval.filePath}</span>
              </div>

              <!-- Meta row -->
              <div class="card-meta">
                <span class="meta-category">{approval.categoryName}</span>
                <span class="meta-date">{vscodeState.formatDate(approval.createdAt)}</span>
              </div>

              <!-- Actions -->
              {#if !selectionMode}
                <div class="card-actions">
                  <button
                    class="action-btn btn-approve"
                    type="button"
                    disabled={isProcessing}
                    onclick={() => handleApprove(approval.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {isProcessing ? '...' : 'Approve'}
                  </button>
                  <button
                    class="action-btn btn-revise"
                    type="button"
                    disabled={isProcessing}
                    onclick={() => handleRevise(approval.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    {isProcessing ? '...' : 'Revise'}
                  </button>
                  <button
                    class="action-btn btn-reject"
                    type="button"
                    disabled={isProcessing}
                    onclick={() => handleReject(approval.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {isProcessing ? '...' : 'Reject'}
                  </button>
                  <button
                    class="action-btn btn-open"
                    type="button"
                    title="Open document"
                    onclick={() => console.log('open-approval', approval.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Batch footer -->
  {#if selectionMode && selectedApprovals.size > 0}
    <div class="batch-footer">
      <div class="batch-header">
        <span class="batch-count">{selectedApprovals.size} item{selectedApprovals.size !== 1 ? 's' : ''} selected</span>
        <button class="batch-clear" type="button" onclick={clearSelection}>Clear All</button>
      </div>
      <div class="batch-actions">
        <button
          class="batch-btn batch-approve"
          type="button"
          disabled={batchProcessing}
          onclick={() => handleBatchAction('approved')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {batchProcessing ? '...' : 'Approve'}
        </button>
        <button
          class="batch-btn batch-revise"
          type="button"
          disabled={batchProcessing}
          onclick={() => handleBatchAction('needs-revision')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          {batchProcessing ? '...' : 'Revise'}
        </button>
        <button
          class="batch-btn batch-reject"
          type="button"
          disabled={batchProcessing}
          onclick={() => handleBatchAction('rejected')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {batchProcessing ? '...' : 'Reject'}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .notifications-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Category bar */
  .category-bar {
    display: flex;
    gap: 6px;
    padding: 8px 12px 6px;
    border-bottom: 1px solid #2e2e2e;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
  }

  .category-bar::-webkit-scrollbar { display: none; }

  .category-pill {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid #2e2e2e;
    background: #1e1e1e;
    color: #555;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .category-pill:hover:not(.pill-active) {
    border-color: #555;
    color: #a0a0a0;
  }

  .pill-active {
    background: #1a3a5e;
    border-color: #2a5080;
    color: #4d9eff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }

  .pill-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    background: rgba(77, 158, 255, 0.2);
    padding: 0 4px;
    border-radius: 6px;
    line-height: 1.4;
  }

  .pill-active .pill-count { background: rgba(77, 158, 255, 0.3); }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid #2e2e2e;
    flex-shrink: 0;
    gap: 8px;
    min-height: 32px;
  }

  .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 6px; flex: 1; }
  .toolbar-right { justify-content: flex-end; }

  .checkbox-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
  }

  .checkbox {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    border: 1.5px solid #444;
    background: #1e1e1e;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.12s;
  }

  .checkbox-checked {
    background: #4d9eff;
    border-color: #4d9eff;
    color: #fff;
  }

  .selected-count { font-size: 11px; color: #4d9eff; font-weight: 500; }
  .pending-label { font-size: 11px; color: #555; font-weight: 500; }

  .mode-btn {
    background: none;
    border: none;
    color: #4d9eff;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    padding: 2px 0;
    transition: color 0.12s;
  }

  .mode-btn:hover { color: #d0d0d0; }

  /* Approvals scroll */
  .approvals-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 20px;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 16px;
    color: #444;
    text-align: center;
    background: rgba(42, 42, 42, 0.3);
    border: 1px dashed #2e2e2e;
    border-radius: 8px;
    margin-top: 8px;
  }

  .empty-state p { font-size: 12px; color: #555; font-style: italic; margin: 0; }

  /* Approval cards */
  .approvals-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .approval-card {
    display: flex;
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
    animation: cardIn 0.25s ease-out both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .approval-card:hover {
    border-color: #3a3a3a;
  }

  .card-hovered {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .card-selected {
    background: rgba(77, 158, 255, 0.04);
    border-color: rgba(77, 158, 255, 0.2);
  }

  .card-accent {
    width: 4px;
    flex-shrink: 0;
    transition: background 0.2s;
  }

  .border-pending { background: rgba(77, 158, 255, 0.4); }
  .border-revision { background: rgba(210, 153, 34, 0.5); }
  .border-default { background: rgba(77, 158, 255, 0.2); }
  .accent-selected { background: #4d9eff; }

  .card-content {
    flex: 1;
    padding: 12px;
    min-width: 0;
  }

  .card-checkbox-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    margin-bottom: 8px;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .card-title {
    font-size: 12px;
    font-weight: 700;
    color: #d0d0d0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.06em;
    white-space: nowrap;
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
  }

  .badge-pending {
    background: rgba(77, 158, 255, 0.12);
    color: #4d9eff;
    border: 1px solid rgba(77, 158, 255, 0.25);
  }

  .badge-revision {
    background: rgba(210, 153, 34, 0.12);
    color: #d29922;
    border: 1px solid rgba(210, 153, 34, 0.25);
  }

  .badge-approved {
    background: rgba(63, 185, 80, 0.12);
    color: #3fb950;
    border: 1px solid rgba(63, 185, 80, 0.25);
  }

  .badge-rejected {
    background: rgba(248, 81, 73, 0.12);
    color: #f85149;
    border: 1px solid rgba(248, 81, 73, 0.25);
  }

  .card-desc {
    font-size: 12px;
    color: #777;
    line-height: 1.5;
    margin: 0 0 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .file-path {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #555;
    background: rgba(42, 42, 42, 0.4);
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid #2a2a2a;
    word-break: break-all;
  }

  .file-path svg { flex-shrink: 0; margin-top: 1px; color: #555; }

  .card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }

  .meta-category {
    font-size: 10px;
    color: #555;
    font-weight: 500;
    text-transform: capitalize;
  }

  .meta-date {
    font-size: 10px;
    color: #444;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Action buttons */
  .card-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
    min-height: 28px;
  }

  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .action-btn:active:not(:disabled) { transform: scale(0.97); }

  .btn-approve {
    background: rgba(63, 185, 80, 0.15);
    border-color: rgba(63, 185, 80, 0.3);
    color: #3fb950;
  }

  .btn-approve:hover:not(:disabled) { background: rgba(63, 185, 80, 0.25); }

  .btn-revise {
    background: transparent;
    border-color: rgba(210, 153, 34, 0.3);
    color: #d29922;
  }

  .btn-revise:hover:not(:disabled) { background: rgba(210, 153, 34, 0.1); }

  .btn-reject {
    background: transparent;
    border-color: rgba(248, 81, 73, 0.3);
    color: #f85149;
  }

  .btn-reject:hover:not(:disabled) { background: rgba(248, 81, 73, 0.1); }

  .btn-open {
    background: transparent;
    border-color: #2e2e2e;
    color: #555;
    padding: 4px 6px;
  }

  .btn-open:hover:not(:disabled) { background: #2a2a2a; color: #a0a0a0; }

  /* Batch footer */
  .batch-footer {
    border-top: 1px solid #2e2e2e;
    background: #252525;
    padding: 10px 14px;
    flex-shrink: 0;
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .batch-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .batch-count { font-size: 11px; font-weight: 600; color: #d0d0d0; }

  .batch-clear {
    background: none;
    border: none;
    color: #555;
    font-size: 11px;
    cursor: pointer;
    transition: color 0.12s;
  }

  .batch-clear:hover { color: #a0a0a0; }

  .batch-actions { display: flex; gap: 6px; }

  .batch-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    height: 32px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
  }

  .batch-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .batch-btn:active:not(:disabled) { transform: scale(0.97); }

  .batch-approve {
    background: rgba(63, 185, 80, 0.15);
    border-color: rgba(63, 185, 80, 0.3);
    color: #3fb950;
  }

  .batch-approve:hover:not(:disabled) { background: rgba(63, 185, 80, 0.25); }

  .batch-revise {
    background: transparent;
    border-color: rgba(210, 153, 34, 0.3);
    color: #d29922;
  }

  .batch-revise:hover:not(:disabled) { background: rgba(210, 153, 34, 0.1); }

  .batch-reject {
    background: transparent;
    border-color: rgba(248, 81, 73, 0.3);
    color: #f85149;
  }

  .batch-reject:hover:not(:disabled) { background: rgba(248, 81, 73, 0.1); }
</style>
