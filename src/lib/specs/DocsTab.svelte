<script lang="ts">
  import { vscodeState } from './vscode.svelte';
  import type { Doc } from './types';

  let searchQueryDocs = $state('');
  let draggedItem = $state<Doc | null>(null);
  let dragTarget = $state<string | null>(null);
  let dragCounter = $state(0);
  let searchTimeout: ReturnType<typeof setTimeout>;
  let contextMenu = $state<{ x: number; y: number; doc: Doc } | null>(null);

  function onSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQueryDocs = val;
      if (val.trim()) {
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

  // Drag & drop with actual tree manipulation
  function onDragStart(e: DragEvent, doc: Doc) {
    draggedItem = doc;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', doc.relativePath);
    }
  }

  function onDragOver(e: DragEvent, path: string) {
    e.preventDefault();
    if (draggedItem && draggedItem.relativePath !== path && !isDescendant(draggedItem.relativePath, path)) {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      dragTarget = path;
    }
  }

  function onDragEnter(e: DragEvent, path: string) {
    e.preventDefault();
    dragCounter++;
    if (draggedItem && draggedItem.relativePath !== path && !isDescendant(draggedItem.relativePath, path)) {
      dragTarget = path;
    }
  }

  function onDragLeave() {
    dragCounter--;
    if (dragCounter === 0) {
      dragTarget = null;
    }
  }

  function onDrop(e: DragEvent, targetPath: string) {
    e.preventDefault();
    dragCounter = 0;
    if (draggedItem && draggedItem.relativePath !== targetPath && !isDescendant(draggedItem.relativePath, targetPath)) {
      moveDocInTree(draggedItem.relativePath, targetPath);
    }
    dragTarget = null;
    draggedItem = null;
  }

  function onDropRoot(e: DragEvent) {
    e.preventDefault();
    dragCounter = 0;
    if (draggedItem && draggedItem.parentPath) {
      moveDocToRoot(draggedItem.relativePath);
    }
    dragTarget = null;
    draggedItem = null;
  }

  function onDragEnd() {
    dragCounter = 0;
    dragTarget = null;
    draggedItem = null;
  }

  // Check if path is a descendant of another path (prevent circular moves)
  function isDescendant(parentPath: string, childPath: string): boolean {
    return childPath.startsWith(parentPath + '/');
  }

  // Move a doc into a folder in the tree
  function moveDocInTree(sourcePath: string, targetFolderPath: string) {
    const sourceDoc = findDocByPath(vscodeState.docs, sourcePath);
    if (!sourceDoc) return;

    // Remove from current location
    const removed = removeDocByPath(vscodeState.docs, sourcePath);
    if (!removed) return;

    // Add to target folder
    const targetFolder = findDocByPath(vscodeState.docs, targetFolderPath);
    if (targetFolder && targetFolder.isDirectory) {
      const newPath = targetFolderPath + '/' + removed.filename;
      const movedDoc = { ...removed, relativePath: newPath, parentPath: targetFolderPath };
      if (targetFolder.children) {
        targetFolder.children = [...targetFolder.children, movedDoc];
      } else {
        targetFolder.children = [movedDoc];
      }
      // Auto-open the target folder
      if (!vscodeState.openFolders.includes(targetFolderPath)) {
        vscodeState.toggleFolder(targetFolderPath);
      }
    }

    vscodeState.docs = [...vscodeState.docs];
  }

  // Move a doc to the root level
  function moveDocToRoot(sourcePath: string) {
    const removed = removeDocByPath(vscodeState.docs, sourcePath);
    if (!removed) return;

    const movedDoc = { ...removed, relativePath: removed.filename, parentPath: undefined };
    vscodeState.docs = [...vscodeState.docs, movedDoc];
  }

  function findDocByPath(docs: Doc[], path: string): Doc | null {
    for (const doc of docs) {
      if (doc.relativePath === path) return doc;
      if (doc.children) {
        const found = findDocByPath(doc.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  function removeDocByPath(docs: Doc[], path: string): Doc | null {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].relativePath === path) {
        const removed = docs.splice(i, 1)[0];
        return removed;
      }
      if (docs[i].children) {
        const found = removeDocByPath(docs[i].children!, path);
        if (found) return found;
      }
    }
    return null;
  }

  // Context menu
  function onContextMenu(e: MouseEvent, doc: Doc) {
    e.preventDefault();
    contextMenu = { x: e.clientX, y: e.clientY, doc };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  // File type icon color
  function fileIconColor(filename: string): string {
    if (filename.endsWith('.md')) return 'icon-md';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'icon-ts';
    if (filename.endsWith('.svelte')) return 'icon-svelte';
    return 'icon-default';
  }
</script>

<svelte:window onclick={closeContextMenu} />

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
    {#if searchQueryDocs}
      <button class="search-clear" type="button" title="Clear search" onclick={() => { searchQueryDocs = ''; vscodeState.setDocsSearchResults(null); }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    {/if}
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="docs-scroll" ondragover={(e) => { e.preventDefault(); }} ondrop={onDropRoot}>
    <!-- Search results -->
    {#if vscodeState.docsSearchResults !== null}
      <div class="section">
        <div class="section-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search Results</span>
          <span class="result-count">{vscodeState.docsSearchResults.length}</span>
        </div>
        <div class="card">
          {#if vscodeState.docsSearchResults.length === 0}
            <div class="empty-search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>No documents found matching "{searchQueryDocs}".</p>
            </div>
          {:else}
            <div class="search-list">
              {#each vscodeState.docsSearchResults as result (result.relativePath)}
                <button
                  class="search-item"
                  type="button"
                  onclick={() => console.log('open-general-document', result.filename, result.relativePath)}
                >
                  <svg class="search-file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <div class="search-info">
                    <span class="search-name">{result.displayName ?? result.name ?? result.filename}</span>
                    <span class="search-path">{result.relativePath}</span>
                  </div>
                  <svg class="search-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>Project Steering</span>
            <div class="section-line"></div>
          </div>
          <div class="steering-card">
            {#each vscodeState.steeringDocs as doc (doc.name)}
              {#if doc.exists}
                <button
                  class="steering-item"
                  type="button"
                  onclick={() => console.log('open-steering-document', doc.name)}
                >
                  <div class="steering-icon-wrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <div class="steering-info">
                    <span class="steering-name">{doc.name}.md</span>
                    <span class="steering-label">Steering doc</span>
                  </div>
                  <svg class="steering-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
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
              class="tree-item {dragTarget === doc.relativePath && doc.isDirectory ? 'drag-over' : ''} {draggedItem?.relativePath === doc.relativePath ? 'dragging' : ''}"
              style="padding-left: {(level * 16) + 8}px;"
              draggable="true"
              ondragstart={(e) => onDragStart(e, doc)}
              ondragover={doc.isDirectory ? (e) => onDragOver(e, doc.relativePath) : undefined}
              ondragenter={doc.isDirectory ? (e) => onDragEnter(e, doc.relativePath) : undefined}
              ondragleave={doc.isDirectory ? onDragLeave : undefined}
              ondrop={doc.isDirectory ? (e) => onDrop(e, doc.relativePath) : undefined}
              ondragend={onDragEnd}
              oncontextmenu={(e) => onContextMenu(e, doc)}
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
                  <svg class="folder-icon {isOpen(doc.relativePath) ? 'folder-open' : ''}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if isOpen(doc.relativePath)}
                      <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1"/>
                      <path d="M4 12h16a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a1 1 0 0 1 1-1z"/>
                    {:else}
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    {/if}
                  </svg>
                  <span class="tree-name folder-name">{doc.displayName ?? doc.name ?? doc.filename}</span>
                  {#if doc.children}
                    <span class="child-count">{doc.children.length}</span>
                  {/if}
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
                  <svg class="file-icon {fileIconColor(doc.filename)}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <div class="empty-tree">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <p>No documents yet. Create one to get started.</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Drop indicator at bottom -->
  {#if draggedItem && draggedItem.parentPath}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="drop-root-hint" ondragover={(e) => e.preventDefault()} ondrop={onDropRoot}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      Drop here to move to root
    </div>
  {/if}

  <!-- Context menu -->
  {#if contextMenu}
    <div class="context-menu" style="left: {contextMenu.x}px; top: {contextMenu.y}px;">
      {#if contextMenu.doc.isDirectory}
        <button class="ctx-item" type="button" onclick={() => { console.log('create-doc-folder', contextMenu!.doc.relativePath); closeContextMenu(); }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          New subfolder
        </button>
        <button class="ctx-item" type="button" onclick={() => { console.log('create-document', contextMenu!.doc.relativePath); closeContextMenu(); }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          New document
        </button>
        <div class="ctx-divider"></div>
      {/if}
      <button class="ctx-item ctx-danger" type="button" onclick={() => { console.log('delete-document', contextMenu!.doc.relativePath, contextMenu!.doc.isDirectory); closeContextMenu(); }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Delete
      </button>
    </div>
  {/if}
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
    padding: 6px 28px 6px 32px;
    font-size: 12px;
    color: #d0d0d0;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'Inter', sans-serif;
  }

  .search-input::placeholder { color: #444; }

  .search-input:focus {
    border-color: #4d9eff;
    box-shadow: 0 0 0 2px rgba(77, 158, 255, 0.15);
  }

  .search-clear {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    background: #2a2a2a;
    border: 1px solid #383838;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #888;
    padding: 0;
    transition: all 0.12s;
  }

  .search-clear:hover {
    background: #383838;
    color: #d0d0d0;
  }

  /* Scroll area */
  .docs-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0 20px;
  }

  /* Sections */
  .section { margin-bottom: 6px; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px 4px;
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

  .result-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    background: #2e2e2e;
    color: #555;
    padding: 0 5px;
    border-radius: 6px;
    line-height: 1.5;
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

  /* Steering card */
  .steering-card {
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    margin: 0 12px;
    overflow: hidden;
  }

  .steering-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    border-top: 1px solid #2a2a2a;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, padding-left 0.15s;
  }

  .steering-item:first-child { border-top: none; }

  .steering-item:hover {
    background: #2a2a2a;
    padding-left: 16px;
  }

  .steering-icon-wrap {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    background: rgba(77, 158, 255, 0.1);
    border: 1px solid rgba(77, 158, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(77, 158, 255, 0.7);
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .steering-item:hover .steering-icon-wrap {
    background: rgba(77, 158, 255, 0.15);
    color: #4d9eff;
  }

  .steering-info {
    flex: 1;
    min-width: 0;
  }

  .steering-name {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #c0c0c0;
  }

  .steering-label {
    display: block;
    font-size: 10px;
    color: #555;
    margin-top: 1px;
  }

  .steering-chevron {
    color: #444;
    flex-shrink: 0;
    transition: color 0.12s, transform 0.15s;
  }

  .steering-item:hover .steering-chevron {
    color: #4d9eff;
    transform: translateX(2px);
  }

  /* Card (search results) */
  .card {
    background: #252525;
    border: 1px solid #2e2e2e;
    border-radius: 6px;
    margin: 0 12px;
    overflow: hidden;
  }

  /* Tree */
  .tree { margin: 0 12px; }

  .tree-item {
    display: flex;
    align-items: center;
    gap: 0;
    padding-right: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.12s;
    min-height: 28px;
    position: relative;
  }

  .tree-item:hover {
    background: rgba(42, 42, 42, 0.6);
  }

  .tree-item.drag-over {
    background: rgba(77, 158, 255, 0.08);
    box-shadow: inset 0 0 0 1px rgba(77, 158, 255, 0.5);
  }

  .tree-item.dragging {
    opacity: 0.4;
  }

  .tree-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    padding: 4px 0;
    cursor: pointer;
    text-align: left;
  }

  .chevron {
    color: #555;
    transition: transform 0.15s ease;
    flex-shrink: 0;
  }

  .chevron-open { transform: rotate(90deg); }

  .folder-icon {
    color: rgba(77, 158, 255, 0.7);
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .folder-open { color: #4d9eff; }

  .file-icon {
    flex-shrink: 0;
    transition: color 0.12s;
  }

  .icon-md { color: #79c0ff; }
  .icon-ts { color: #3178c6; }
  .icon-svelte { color: #ff3e00; }
  .icon-default { color: #666; }

  .tree-item:hover .file-icon { filter: brightness(1.3); }

  .spacer { width: 12px; flex-shrink: 0; }

  .tree-name {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .folder-name { font-weight: 500; color: #d0d0d0; }

  .file-name { color: #888; }
  .tree-item:hover .file-name { color: #d0d0d0; }

  .child-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #555;
    background: #1e1e1e;
    border: 1px solid #2e2e2e;
    padding: 0 4px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  /* Hover actions */
  .hover-actions {
    display: flex;
    gap: 1px;
    opacity: 0;
    transition: opacity 0.12s;
    flex-shrink: 0;
  }

  .tree-item:hover .hover-actions { opacity: 1; }

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

  .hover-btn:hover { background: #333; color: #a0a0a0; }
  .hover-btn-danger:hover { background: rgba(248, 81, 73, 0.15); color: #f85149; }

  /* Search results */
  .search-list { display: flex; flex-direction: column; }

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
    transition: background 0.12s, padding-left 0.15s;
  }

  .search-item:first-child { border-top: none; }
  .search-item:hover { background: #2a2a2a; padding-left: 16px; }

  .search-file-icon { color: #555; flex-shrink: 0; }

  .search-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .search-name { font-size: 12px; font-weight: 500; color: #c0c0c0; }
  .search-path { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #555; }

  .search-chevron {
    color: #444;
    flex-shrink: 0;
    transition: color 0.12s, transform 0.15s;
  }

  .search-item:hover .search-chevron {
    color: #4d9eff;
    transform: translateX(2px);
  }

  .empty-search {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    color: #555;
    text-align: center;
  }

  .empty-search p { font-size: 12px; color: #555; font-style: italic; margin: 0; }

  .empty-tree {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 12px;
    color: #444;
    text-align: center;
  }

  .empty-tree p { font-size: 12px; color: #555; margin: 0; }

  /* Drop root hint */
  .drop-root-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    margin: 0 12px 8px;
    border: 1px dashed rgba(77, 158, 255, 0.3);
    border-radius: 6px;
    color: rgba(77, 158, 255, 0.6);
    font-size: 11px;
    background: rgba(77, 158, 255, 0.04);
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Context menu */
  .context-menu {
    position: fixed;
    background: #252525;
    border: 1px solid #383838;
    border-radius: 6px;
    padding: 4px;
    min-width: 140px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    z-index: 100;
    animation: menuIn 0.1s ease;
  }

  @keyframes menuIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .ctx-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 5px 10px;
    background: none;
    border: none;
    border-radius: 4px;
    color: #c0c0c0;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .ctx-item:hover { background: #2a2a2a; }
  .ctx-item svg { color: #555; }
  .ctx-item:hover svg { color: #a0a0a0; }

  .ctx-danger { color: #f85149; }
  .ctx-danger:hover { background: rgba(248, 81, 73, 0.1); }
  .ctx-danger svg { color: #f85149; }

  .ctx-divider {
    height: 1px;
    background: #2e2e2e;
    margin: 4px 0;
  }
</style>
