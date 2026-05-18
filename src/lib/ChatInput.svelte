<script lang="ts">
  import { chatStore } from './store.svelte';
  import type { ModeId, ModelId } from './types';

  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  const MODELS: { id: ModelId; label: string }[] = [
    { id: 'gemini-3-flash', label: 'Gemini 3 Flash' },
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'claude-sonnet', label: 'Claude Sonnet' },
    { id: 'claude-haiku', label: 'Claude Haiku' },
  ];

  const MODES: { id: ModeId; label: string }[] = [
    { id: 'build', label: 'Build' },
    { id: 'ask', label: 'Ask' },
    { id: 'debug', label: 'Debug' },
  ];

  const MENTION_SUGGESTIONS = [
    'main', 'src/main.ts', 'src/app.css', 'package.json',
    'README.md', 'ServerManager', 'KeyboardProxy', 'vite.config.ts',
  ];

  function autoResize() {
    if (!textareaEl) return;
    textareaEl.style.height = 'auto';
    const max = 140;
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, max) + 'px';
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    chatStore.setInputValue(target.value);
    autoResize();

    const val = target.value;
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1 && atIdx === val.length - 1 || (atIdx !== -1 && val.slice(atIdx + 1).match(/^\w*$/))) {
      chatStore.setMentionQuery(val.slice(atIdx + 1));
      chatStore.setShowMentionPicker(true);
    } else {
      chatStore.setShowMentionPicker(false);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') {
      chatStore.setShowMentionPicker(false);
    }
  }

  function submit() {
    if (!chatStore.inputValue.trim() || chatStore.isLoading) return;
    chatStore.sendMessage(chatStore.inputValue);
    if (textareaEl) {
      textareaEl.style.height = 'auto';
    }
  }

  function insertMention(item: string) {
    const val = chatStore.inputValue;
    const atIdx = val.lastIndexOf('@');
    const newVal = val.slice(0, atIdx) + '@' + item + ' ';
    chatStore.setInputValue(newVal);
    chatStore.setShowMentionPicker(false);
    textareaEl?.focus();
  }

  const filteredSuggestions = $derived(
    MENTION_SUGGESTIONS.filter(s =>
      s.toLowerCase().includes(chatStore.mentionQuery.toLowerCase())
    ).slice(0, 6)
  );
</script>

<div class="input-container">
  {#if chatStore.showMentionPicker && filteredSuggestions.length > 0}
    <div class="mention-picker">
      {#each filteredSuggestions as item}
        <button
          class="mention-item"
          type="button"
          onmousedown={(e) => { e.preventDefault(); insertMention(item); }}
        >
          <span class="mention-at">@</span>
          <span>{item}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div class="input-wrapper">
    <textarea
      bind:this={textareaEl}
      class="chat-textarea"
      placeholder="Ask a question or give a task..."
      value={chatStore.inputValue}
      oninput={handleInput}
      onkeydown={handleKeydown}
      rows="1"
      disabled={chatStore.isLoading}
    ></textarea>

    <div class="input-actions">
      <button class="action-btn icon-btn" type="button" title="Add file">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      <button
        class="send-btn"
        type="button"
        onclick={submit}
        disabled={!chatStore.inputValue.trim() || chatStore.isLoading}
        title="Send (Enter)"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="toolbar">
    <div class="toolbar-left">
      <select
        class="toolbar-select mode-select"
        value={chatStore.selectedMode}
        onchange={(e) => chatStore.setSelectedMode((e.target as HTMLSelectElement).value as ModeId)}
      >
        {#each MODES as m}
          <option value={m.id}>{m.label}</option>
        {/each}
      </select>

      <div class="separator"></div>

      <button class="toolbar-btn" type="button">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
        <select
          class="inline-select"
          value={chatStore.selectedModel}
          onchange={(e) => chatStore.setSelectedModel((e.target as HTMLSelectElement).value as ModelId)}
        >
          {#each MODELS as m}
            <option value={m.id}>{m.label}</option>
          {/each}
        </select>
      </button>

      <div class="separator"></div>

      <button class="toolbar-btn" type="button" title="Default context">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        <span>Default</span>
      </button>
    </div>

    <div class="toolbar-right">
      <button class="toolbar-btn" type="button" title="Terminal">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .input-container {
    position: relative;
    border-top: 1px solid #2e2e2e;
    background: #1e1e1e;
  }

  .mention-picker {
    position: absolute;
    bottom: 100%;
    left: 12px;
    right: 12px;
    background: #252525;
    border: 1px solid #383838;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.4);
    z-index: 100;
    animation: slideUp 0.15s ease-out;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .mention-item {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 7px 12px;
    background: none;
    border: none;
    color: #c0c0c0;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .mention-item:hover {
    background: #2e2e2e;
    color: #e8e8e8;
  }

  .mention-at {
    color: #4d9eff;
    font-weight: 600;
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 10px 12px 8px;
  }

  .chat-textarea {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    resize: none;
    color: #e0e0e0;
    font-size: 13px;
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.5;
    min-height: 22px;
    max-height: 140px;
    overflow-y: auto;
    padding: 0;
  }

  .chat-textarea::placeholder {
    color: #555;
  }

  .chat-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .icon-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid #333;
    background: #252525;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }

  .icon-btn:hover {
    background: #2e2e2e;
    color: #a0a0a0;
    border-color: #404040;
  }

  .send-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: none;
    background: #4d9eff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }

  .send-btn:hover:not(:disabled) {
    background: #6aadff;
  }

  .send-btn:disabled {
    background: #2a3a50;
    color: #4a6080;
    cursor: not-allowed;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 8px;
  }

  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .separator {
    width: 1px;
    height: 12px;
    background: #333;
    margin: 0 2px;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 7px;
    border: none;
    background: none;
    color: #666;
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
    position: relative;
  }

  .toolbar-btn:hover {
    background: #2a2a2a;
    color: #a0a0a0;
  }

  .toolbar-select {
    background: none;
    border: none;
    outline: none;
    color: #666;
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 3px 6px;
    border-radius: 4px;
    appearance: none;
    transition: color 0.15s;
  }

  .toolbar-select:hover {
    color: #a0a0a0;
    background: #2a2a2a;
  }

  .mode-select option,
  .inline-select option {
    background: #252525;
    color: #e0e0e0;
  }

  .inline-select {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }
</style>
