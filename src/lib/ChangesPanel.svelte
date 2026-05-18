<script lang="ts">
  const changes = [
    { file: 'src/main.ts', additions: 12, deletions: 3, type: 'ts' },
    { file: 'src/ServerManager.ts', additions: 45, deletions: 0, type: 'ts' },
    { file: 'src/webview/templates/loading.html', additions: 8, deletions: 2, type: 'html' },
    { file: 'package.json', additions: 3, deletions: 1, type: 'json' },
  ];
</script>

<div class="changes-panel">
  <div class="changes-header">
    <span class="changes-title">Working changes</span>
    <div class="changes-actions">
      <button class="action-btn" type="button">Discard all</button>
      <button class="action-btn primary" type="button">Accept all</button>
    </div>
  </div>

  <div class="changes-list">
    {#each changes as change}
      <div class="change-item">
        <div class="change-icon {change.type}"></div>
        <span class="change-file">{change.file}</span>
        <div class="change-stats">
          <span class="additions">+{change.additions}</span>
          <span class="deletions">-{change.deletions}</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="changes-empty-hint">
    <p>Review the proposed changes above. Accept or discard each file.</p>
  </div>
</div>

<style>
  .changes-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .changes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
    border-bottom: 1px solid #2e2e2e;
  }

  .changes-title {
    font-size: 11px;
    font-weight: 500;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .changes-actions {
    display: flex;
    gap: 6px;
  }

  .action-btn {
    padding: 3px 9px;
    border-radius: 5px;
    font-size: 11px;
    border: 1px solid #383838;
    background: #252525;
    color: #888;
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: #2e2e2e;
    color: #c0c0c0;
  }

  .action-btn.primary {
    background: #1a3a5e;
    border-color: #2a5080;
    color: #79c0ff;
  }

  .action-btn.primary:hover {
    background: #243a5e;
  }

  .changes-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .change-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    cursor: pointer;
    transition: background 0.1s;
  }

  .change-item:hover {
    background: #252525;
  }

  .change-icon {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .change-icon.ts { background: #3178c6; }
  .change-icon.html { background: #e34c26; }
  .change-icon.json { background: #cbcb41; }
  .change-icon.css { background: #264de4; }

  .change-file {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #b0b0b0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .change-stats {
    display: flex;
    gap: 5px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
  }

  .additions { color: #3fb950; }
  .deletions { color: #f85149; }

  .changes-empty-hint {
    padding: 12px 16px;
    border-top: 1px solid #2e2e2e;
  }

  .changes-empty-hint p {
    font-size: 11px;
    color: #555;
    margin: 0;
    line-height: 1.5;
  }
</style>
