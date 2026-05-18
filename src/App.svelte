<script lang="ts">
  import ChatPanel from './lib/ChatPanel.svelte';
</script>

<div class="app-shell">
  <div class="ide-layout">
    <!-- Simulated editor area -->
    <div class="editor-area">
      <div class="editor-tabs">
        <div class="editor-tab active">
          <span class="tab-icon ts"></span>
          <span>main.ts</span>
          <button class="close-tab" type="button">×</button>
        </div>
        <div class="editor-tab">
          <span class="tab-icon html"></span>
          <span>loading.html</span>
          <button class="close-tab" type="button">×</button>
        </div>
      </div>
      <div class="editor-content">
        <div class="line-numbers">
          {#each Array(22) as _, i}
            <span>{i + 1}</span>
          {/each}
        </div>
        <div class="code-content">
          <div class="code-line"><span class="kw">import</span> <span class="str">'./app.css'</span></div>
          <div class="code-line"><span class="kw">import</span> App <span class="kw">from</span> <span class="str">'./App.svelte'</span></div>
          <div class="code-line"></div>
          <div class="code-line"><span class="kw">const</span> server = <span class="kw">new</span> <span class="type">ServerManager</span>(&#123;&#125;)</div>
          <div class="code-line"></div>
          <div class="code-line"><span class="cm">// Initialize extension context</span></div>
          <div class="code-line"><span class="kw">export function</span> <span class="fn">activate</span>(context: vscode.ExtensionContext) &#123;</div>
          <div class="code-line indent"><span class="fn">server</span>.<span class="fn">start</span>()</div>
          <div class="code-line indent"><span class="kw">const</span> panel = vscode.window.<span class="fn">createWebviewPanel</span>(</div>
          <div class="code-line indent2"><span class="str">'chat'</span>,</div>
          <div class="code-line indent2"><span class="str">'AI Assistant'</span>,</div>
          <div class="code-line indent2">vscode.ViewColumn.Two</div>
          <div class="code-line indent">)</div>
          <div class="code-line">&#125;</div>
          <div class="code-line"></div>
          <div class="code-line"><span class="kw">export function</span> <span class="fn">deactivate</span>() &#123;</div>
          <div class="code-line indent"><span class="fn">server</span>.<span class="fn">stop</span>()</div>
          <div class="code-line">&#125;</div>
        </div>
      </div>
    </div>

    <!-- AI Chat sidebar -->
    <div class="chat-sidebar">
      <ChatPanel />
    </div>
  </div>
</div>

<style>
  .app-shell {
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #1a1a1a;
    overflow: hidden;
  }

  .ide-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .editor-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
    border-right: 1px solid #2e2e2e;
    overflow: hidden;
    min-width: 0;
  }

  .editor-tabs {
    display: flex;
    background: #1a1a1a;
    border-bottom: 1px solid #2e2e2e;
    height: 38px;
    overflow: hidden;
  }

  .editor-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px 0 12px;
    font-size: 12px;
    color: #666;
    border-right: 1px solid #2e2e2e;
    cursor: pointer;
    transition: background 0.1s;
    white-space: nowrap;
  }

  .editor-tab:hover {
    background: #252525;
    color: #a0a0a0;
  }

  .editor-tab.active {
    background: #1e1e1e;
    color: #e0e0e0;
    border-bottom: 1px solid #1e1e1e;
    margin-bottom: -1px;
  }

  .tab-icon {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .tab-icon.ts { background: #3178c6; }
  .tab-icon.html { background: #e34c26; }

  .close-tab {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    transition: all 0.1s;
  }

  .close-tab:hover {
    background: #383838;
    color: #c0c0c0;
  }

  .editor-content {
    flex: 1;
    display: flex;
    overflow: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    line-height: 1.7;
  }

  .line-numbers {
    display: flex;
    flex-direction: column;
    padding: 16px 12px 16px 16px;
    color: #444;
    text-align: right;
    font-size: 12px;
    user-select: none;
    min-width: 42px;
    flex-shrink: 0;
    border-right: 1px solid #252525;
  }

  .line-numbers span {
    display: block;
  }

  .code-content {
    padding: 16px 16px 16px 14px;
    flex: 1;
  }

  .code-line {
    white-space: pre;
    color: #c9d1d9;
    height: 1.7em;
  }

  :global(.code-line .indent) { padding-left: 2ch; }
  .code-line.indent { padding-left: 2ch; }
  .code-line.indent2 { padding-left: 4ch; }

  :global(.kw) { color: #ff7b72; }
  :global(.str) { color: #a5d6ff; }
  :global(.fn) { color: #d2a8ff; }
  :global(.type) { color: #79c0ff; }
  :global(.cm) { color: #8b949e; font-style: italic; }

  .chat-sidebar {
    width: 340px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 700px) {
    .editor-area {
      display: none;
    }
    .chat-sidebar {
      width: 100%;
    }
  }
</style>
