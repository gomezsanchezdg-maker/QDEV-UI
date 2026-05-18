<script lang="ts">
  import ChatPanel from './lib/ChatPanel.svelte';
  import SpecsApp from './lib/specs/SpecsApp.svelte';

  // Simple hash-based router
  let route = $state(window.location.hash === '#/specs' ? 'specs' : 'chat');

  function navigate(r: string) {
    route = r;
    window.location.hash = r === 'specs' ? '#/specs' : '#/';
  }

  // Sync from hash changes (back/forward)
  $effect(() => {
    function onHashChange() {
      route = window.location.hash === '#/specs' ? 'specs' : 'chat';
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });
</script>

<div class="app-shell">
  <!-- Top nav bar -->
  <div class="top-nav">
    <div class="nav-brand">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
      <span>AI IDE</span>
    </div>
    <nav class="nav-links">
      <button
        class="nav-link {route === 'chat' ? 'nav-active' : ''}"
        type="button"
        onclick={() => navigate('chat')}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Chat
      </button>
      <button
        class="nav-link {route === 'specs' ? 'nav-active' : ''}"
        type="button"
        onclick={() => navigate('specs')}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        Specs
      </button>
    </nav>
  </div>

  <div class="content-area">
    {#if route === 'chat'}
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
    {:else}
      <!-- Specs route — simulated VS Code sidebar layout -->
      <div class="specs-layout">
        <div class="specs-sidebar">
          <SpecsApp />
        </div>
        <div class="specs-editor">
          <div class="editor-tabs">
            <div class="editor-tab active">
              <span class="tab-icon svelte"></span>
              <span>SpecsApp.svelte</span>
              <button class="close-tab" type="button">×</button>
            </div>
            <div class="editor-tab">
              <span class="tab-icon ts"></span>
              <span>vscode.svelte.ts</span>
              <button class="close-tab" type="button">×</button>
            </div>
          </div>
          <div class="editor-content">
            <div class="line-numbers">
              {#each Array(28) as _, i}
                <span>{i + 1}</span>
              {/each}
            </div>
            <div class="code-content">
              <div class="code-line"><span class="cm">// spec-workflow / sidebar webview</span></div>
              <div class="code-line"><span class="kw">import</span> &#123; vscodeState &#125; <span class="kw">from</span> <span class="str">'./vscode.svelte'</span></div>
              <div class="code-line"><span class="kw">import</span> OverviewTab <span class="kw">from</span> <span class="str">'./OverviewTab.svelte'</span></div>
              <div class="code-line"><span class="kw">import</span> RoadmapTab <span class="kw">from</span> <span class="str">'./RoadmapTab.svelte'</span></div>
              <div class="code-line"><span class="kw">import</span> LogsTab <span class="kw">from</span> <span class="str">'./LogsTab.svelte'</span></div>
              <div class="code-line"></div>
              <div class="code-line"><span class="kw">let</span> activeTab = <span class="fn">$state</span>(<span class="str">'overview'</span>)</div>
              <div class="code-line"></div>
              <div class="code-line"><span class="kw">const</span> tabs = [</div>
              <div class="code-line indent">&#123; id: <span class="str">'overview'</span>, label: <span class="str">'Overview'</span> &#125;,</div>
              <div class="code-line indent">&#123; id: <span class="str">'roadmap'</span>, label: <span class="str">'Roadmap'</span> &#125;,</div>
              <div class="code-line indent">&#123; id: <span class="str">'logs'</span>, label: <span class="str">'Logs'</span> &#125;,</div>
              <div class="code-line">]</div>
              <div class="code-line"></div>
              <div class="code-line"><span class="kw">const</span> activeSpecs = <span class="fn">$derived</span>(</div>
              <div class="code-line indent">vscodeState.specs.<span class="fn">filter</span>(s =&gt; !s.isEpic)</div>
              <div class="code-line">)</div>
              <div class="code-line"></div>
              <div class="code-line"><span class="kw">function</span> <span class="fn">handleTabChange</span>(id: <span class="type">string</span>) &#123;</div>
              <div class="code-line indent">activeTab = id <span class="kw">as</span> <span class="type">TabId</span></div>
              <div class="code-line">&#125;</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
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

  /* Top nav */
  .top-nav {
    display: flex;
    align-items: center;
    height: 36px;
    background: #111;
    border-bottom: 1px solid #252525;
    padding: 0 12px;
    gap: 16px;
    flex-shrink: 0;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4d9eff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .nav-links {
    display: flex;
    gap: 2px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 5px;
    border: none;
    background: none;
    color: #555;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .nav-link:hover:not(.nav-active) {
    color: #a0a0a0;
    background: #1e1e1e;
  }

  .nav-link.nav-active {
    color: #e0e0e0;
    background: #252525;
  }

  .content-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Chat layout (original) */
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

  /* Specs layout */
  .specs-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .specs-sidebar {
    width: 340px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 1px solid #2e2e2e;
  }

  .specs-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
    overflow: hidden;
    min-width: 0;
  }

  /* Shared editor styles */
  .editor-tabs {
    display: flex;
    background: #1a1a1a;
    border-bottom: 1px solid #2e2e2e;
    height: 38px;
    overflow: hidden;
    flex-shrink: 0;
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
  .tab-icon.svelte { background: #ff3e00; }

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
    .editor-area,
    .specs-editor {
      display: none;
    }
    .chat-sidebar,
    .specs-sidebar {
      width: 100%;
    }
  }
</style>
