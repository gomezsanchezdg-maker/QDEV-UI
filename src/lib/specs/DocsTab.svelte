<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import type { Doc } from './types';

  let searchQueryDocs = $state('');
  let draggedItem = $state<Doc | null>(null);
  let dragTarget = $state<string | null>(null);
  let searchTimeout: ReturnType<typeof setTimeout>;

  function onSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQueryDocs = val;
      if (val.trim()) {
        // Simulate search: flatten all docs and filter
        const all = flattenAllDocs(vscodeState.docs);
        const q = val.toLowerCase();
        const results = all.filter(d =>
          !d.isDirectory && (
            (d.displayName ?? d.name ?? d.filename).toLowerCase().includes(q) ||
            d.relativePath.toLowerCase().includes(q)
          )
        );
        vscodeState.setDocsSearchResults(results.length > 0 ? results : []);
      } else {
        vscodeState.setDocsSearchResults(null);
      }
    }, 300);
  }

  interface FlatDoc {
    doc: Doc;
    level: number;
  }

  function flattenDocsTree(docs: Doc[], level = 0): FlatDoc[] {
    const result: FlatDoc[] = [];
    for (const doc of docs) {
      result.push({ doc, level });
      if (doc.isDirectory && doc.children && vscodeState.openFolders.includes(doc.relativePath)) {
        result.push(...flattenDocsTree(doc.children, level + 1));
      }
    }
    return result;
  }

  function flattenAllDocs(docs: Doc[]): Doc[] {
    const result: Doc[] = [];
    for (const doc of docs) {
      if (!doc.isDirectory) result.push(doc);
      if (doc.children) result.push(...flattenAllDocs(doc.children));
    }
    return result;
  }

  const flatDocs = $derived(flattenDocsTree(vscodeState.docs));

  function isOpen(path: string): boolean {
    return vscodeState.openFolders.includes(path);
  }

  // Drag & drop
  function onDragStart(e: DragEvent, doc: Doc) {
    draggedItem = doc;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', doc.relativePath);
    }
  }

  function onDragOver(e: DragEvent, path: string) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    dragTarget = path;
  }

  function onDragLeave() {
    dragTarget = null;
  }

  function onDrop(e: DragEvent, targetPath: string) {
    e.preventDefault();
    if (draggedItem && draggedItem.relativePath !== targetPath) {
      // Delegate to host
      console.log('move-doc', draggedItem.relativePath, targetPath);
    }
    dragTarget = null;
    draggedItem = null;
  }

  function onDragEnd() {
    dragTarget = null;
    draggedItem = null;
  }
</script>

<div class="docs-tab">
  <!-- Search -->
  <div class="search-wrap">
    <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      class="search-input"
      type="text"
      placeholder="Search documents..."
      value={searchQueryDocs}
      oninput={onSearchInput}
    />
  </div>

  <div class="docs-scroll">
    <!-- Search results -->
    {#if vscodeState.docsSearchResults !== null}
      <div class="section">
        <div class="section-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search Results</span>
        </div>
        <div class="card">
          {#if vscodeState.docsSearchResults.length === 0}
            <div class="empty-search">
              No documents found matching "{searchQueryDocs}".
            </div>
          {:else}
            <div class="search-list">
              {#each vscodeState.docsSearchResults as result (result.relativePath)}
                <button
                  class="search-item"
                  type="button"
                  onclick={() => console.log('open-general-document', result.filename, result.relativePath)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <div class="search-info">
                    <span class="search-name">{result.displayName ?? result.name ?? result.filename}</span>
                    <span class="search-path">{result.relativePath}</span>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Project Steering -->
      {#if vscodeState.steeringDocs.length > 0}
        <div class="section">
          <div class="section-header">
            <span>Project Steering</span>
            <div class="section-line"></div>
          </div>
          <div class="card">
            {#each vscodeState.steeringDocs as doc (doc.name)}
              {#if doc.exists}
                <button
                  class="steering-item"
                  type="button"
                  onclick={() => console.log('open-steering-document', doc.name)}
                >
                  <svg class="steering-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span class="steering-name">{doc.name}.md</span>
                </button>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- Your Docs -->
      <div class="section">
        <div class="section-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Your Docs</span>
          <div class="section-actions">
            <button class="action-btn" type="button" title="New folder" onclick={() => console.log('create-doc-folder', '')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </button>
            <button class="action-btn" type="button" title="New document" onclick={() => console.log('create-document', '')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="tree">
          {#each flatDocs as { doc, level } (doc.relativePath)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="tree-item group {dragTarget === doc.relativePath && doc.isDirectory ? 'drag-over' : ''}"
              style="padding-left: {(level * 16) + 8}px;"
              draggable="true"
              ondragstart={(e) => onDragStart(e, doc)}
              ondragover={doc.isDirectory ? (e) => onDragOver(e, doc.relativePath) : undefined}
              ondragleave={doc.isDirectory ? onDragLeave : undefined}
              ondrop={doc.isDirectory ? (e) => onDrop(e, doc.relativePath) : undefined}
              ondragend={onDragEnd}
            >
              {#if doc.isDirectory}
                <button
                  class="tree-row"
                  type="button"
                  onclick={() => vscodeState.toggleFolder(doc.relativePath)}
                >
                  <svg class="chevron {isOpen(doc.relativePath) ? 'chevron-open' : ''}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  <svg class="folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span class="tree-name folder-name">{doc.displayName ?? doc.name ?? doc.filename}</span>
                </button>
                <!-- Hover actions for folders -->
                <div class="hover-actions">
                  <button class="hover-btn" type="button" title="New subfolder" onclick={() => console.log('create-doc-folder', doc.relativePath)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="11" x2="12" y2="17"/>
                      <line x1="9" y1="14" x2="15" y2="14"/>
                    </svg>
                  </button>
                  <button class="hover-btn" type="button" title="New document" onclick={() => console.log('create-document', doc.relativePath)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </button>
                  <button class="hover-btn" type="button" title="Edit metadata" onclick={() => console.log('open-folder-metadata-modal', doc.relativePath)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="13.5" cy="6.5" r="2.5"/>
                      <path d="M17.5 10.5 20 8l-2.5-2.5"/>
                      <path d="m2 21 8.5-8.5"/>
                      <path d="m4 19 8.5-8.5"/>
                    </svg>
                  </button>
                  <button class="hover-btn hover-btn-danger" type="button" title="Delete folder" onclick={() => console.log('delete-document', doc.relativePath, true)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              {:else}
                <button
                  class="tree-row"
                  type="button"
                  onclick={() => console.log('open-general-document', doc.filename, doc.relativePath)}
                >
                  <div class="spacer"></div>
                  <svg class="file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span class="tree-name file-name">{doc.displayName ?? doc.name ?? doc.filename}</span>
                </button>
                <!-- Hover actions for files -->
                <div class="hover-actions">
                  <button class="hover-btn hover-btn-danger" type="button" title="Delete file" onclick={() => console.log('delete-document', doc.relativePath, false)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              {/if}
            </div>
          {/each}

          {#if flatDocs.length === 0}
            <div class="empty-tree">No documents yet.</div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .docs-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Search */
  .search-wrap {
    position: relative;
    padding: 10px 12px 8px;
    border-bottom: 1px solid #2e2e2e;
    flex-shrink: 0;
  }

  .search-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 1px;
    color: #555;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: rgba(30, 30, 30, 0.5);
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    padding: 6px 10px 6px 32px;
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

  /* Scroll area */
  .docs-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0 20px;
  }

  /* Sections */
  .section {
    margin-bottom: 4px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px 4px;
    font-size: 10px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: #2e2e2e;
    margin-left: 8px;
  }

  .section-actions {
    display: flex;
    gap: 2px;
    margin-left: auto;
  }

  .action-btn {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: none;
    background: none;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.12s;
    padding: 0;
  }

  .action-btn:hover {
    background: #2a2a2a;
    color: #4d9eff;
  }

  /* Card */
  .card {
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    margin: 0 12px;
    overflow: hidden;
  }

  /* Steering items */
  .steering-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 12px;
    background: none;
    border: none;
    border-top: 1px solid #2a2a2a;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
  }

  .steering-item:first-child {
    border-top: none;
  }

  .steering-item:hover {
    background: #2a2a2a;
  }

  .steering-icon {
    color: rgba(77, 158, 255, 0.6);
    flex-shrink: 0;
  }

  .steering-item:hover .steering-icon {
    color: #4d9eff;
  }

  .steering-name {
    font-size: 12px;
    font-weight: 500;
    color: #c0c0c0;
  }

  /* Tree */
  .tree {
    margin: 0 12px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    gap: 0;
    padding-right: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.12s;
    min-height: 32px;
    position: relative;
  }

  .tree-item:hover {
    background: rgba(42, 42, 42, 0.6);
  }

  .tree-item.drag-over {
    background: rgba(77, 158, 255, 0.08);
    box-shadow: inset 0 0 0 1px #4d9eff;
  }

  .tree-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    padding: 5px 0;
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

  .folder-icon {
    color: rgba(77, 158, 255, 0.7);
    flex-shrink: 0;
  }

  .file-icon {
    color: #666;
    flex-shrink: 0;
  }

  .tree-item:hover .file-icon {
    color: #a0a0a0;
  }

  .spacer {
    width: 12px;
    flex-shrink: 0;
  }

  .tree-name {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .folder-name {
    font-weight: 500;
    color: #d0d0d0;
  }

  .file-name {
    color: #888;
  }

  .tree-item:hover .file-name {
    color: #d0d0d0;
  }

  /* Hover actions */
  .hover-actions {
    display: flex;
    gap: 1px;
    opacity: 0;
    transition: opacity 0.12s;
    flex-shrink: 0;
  }

  .tree-item:hover .hover-actions {
    opacity: 1;
  }

  .hover-btn {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    border: none;
    background: none;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.1s;
    padding: 0;
  }

  .hover-btn:hover {
    background: #333;
    color: #a0a0a0;
  }

  .hover-btn-danger:hover {
    background: rgba(248, 81, 73, 0.15);
    color: #f85149;
  }

  /* Search results */
  .search-list {
    display: flex;
    flex-direction: column;
  }

  .search-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 12px;
    background: none;
    border: none;
    border-top: 1px solid #2a2a2a;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
  }

  .search-item:first-child {
    border-top: none;
  }

  .search-item:hover {
    background: #2a2a2a;
  }

  .search-item svg {
    color: #555;
    flex-shrink: 0;
  }

  .search-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .search-name {
    font-size: 12px;
    font-weight: 500;
    color: #c0c0c0;
  }

  .search-path {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    color: #555;
  }

  .empty-search {
    padding: 16px 12px;
    font-size: 12px;
    color: #555;
    font-style: italic;
    text-align: center;
  }

  .empty-tree {
    padding: 16px 12px;
    font-size: 12px;
    color: #555;
    text-align: center;
  }
</style>
