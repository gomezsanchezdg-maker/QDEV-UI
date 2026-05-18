<script lang="ts">
  import type { Message } from './types';

  interface Props {
    message: Message;
  }

  let { message }: Props = $props();

  function renderContent(text: string): string {
    let result = text;

    // Code blocks
    result = result.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<div class="code-block-wrapper"><div class="code-block-header">${lang || 'code'}</div><pre class="code-block"><code>${escaped}</code></pre></div>`;
    });

    // Inline code
    result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>');

    // H3
    result = result.replace(/^### (.+)$/gm, '<h3 class="msg-h3">$1</h3>');

    // H2
    result = result.replace(/^## (.+)$/gm, '<h2 class="msg-h2">$1</h2>');

    // Lists
    result = result.replace(/^- (.+)$/gm, '<li class="msg-li">$1</li>');
    result = result.replace(/((<li[^>]*>.*<\/li>\n?)+)/gs, '<ul class="msg-ul">$1</ul>');

    // Paragraphs (only for non-html lines)
    result = result.replace(/\n{2,}/g, '\n');

    return result;
  }
</script>

<div class="message-wrapper {message.role === 'user' ? 'user' : 'assistant'}">
  {#if message.role === 'assistant'}
    <div class="assistant-avatar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
  {/if}

  <div class="message-content {message.role}">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html renderContent(message.content)}

    {#if message.fileRefs && message.fileRefs.length > 0}
      <div class="file-refs">
        {#each message.fileRefs as ref}
          <button class="file-ref-chip" type="button">
            <span class="file-icon {ref.type}"></span>
            <span class="file-name">{ref.name}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .message-wrapper {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    animation: slideUp 0.2s ease-out;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-wrapper.assistant {
    align-items: flex-start;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .assistant-avatar {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: #1a3a5e;
    border: 1px solid #2a5080;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4d9eff;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .message-content {
    font-size: 13px;
    line-height: 1.65;
    color: #d0d0d0;
    max-width: 100%;
    word-break: break-word;
  }

  .message-content.user {
    background: #1a3a5e;
    border: 1px solid #2a5080;
    border-radius: 10px 10px 2px 10px;
    padding: 8px 12px;
    color: #c8e0ff;
    max-width: 85%;
  }

  :global(.msg-h2) {
    font-size: 13px;
    font-weight: 600;
    color: #e8e8e8;
    margin: 10px 0 6px;
  }

  :global(.msg-h3) {
    font-size: 12px;
    font-weight: 600;
    color: #c0c0c0;
    margin: 8px 0 4px;
  }

  :global(.msg-ul) {
    margin: 6px 0;
    padding: 0;
    list-style: none;
  }

  :global(.msg-li) {
    display: flex;
    gap: 6px;
    padding: 2px 0;
    color: #b8b8b8;
  }

  :global(.msg-li::before) {
    content: '•';
    color: #4d9eff;
    flex-shrink: 0;
    margin-top: 1px;
  }

  :global(.inline-code) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82em;
    background: #1e2a3a;
    color: #79c0ff;
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid #2a3a50;
  }

  :global(.code-block-wrapper) {
    margin: 8px 0;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #2e2e2e;
  }

  :global(.code-block-header) {
    background: #252525;
    color: #666;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    padding: 4px 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #2e2e2e;
  }

  :global(.code-block) {
    background: #1a1a1a;
    padding: 10px 12px;
    margin: 0;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    line-height: 1.6;
    color: #c9d1d9;
  }

  .file-refs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 10px;
  }

  .file-ref-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #1e2a38;
    border: 1px solid #2a3a50;
    border-radius: 5px;
    padding: 3px 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #79c0ff;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .file-ref-chip:hover {
    background: #243040;
    border-color: #3a5070;
  }

  .file-icon {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .file-icon.ts { background: #3178c6; }
  .file-icon.html { background: #e34c26; }
  .file-icon.css { background: #264de4; }
  .file-icon.js { background: #f7df1e; }
  .file-icon.svelte { background: #ff3e00; }
  .file-icon.other { background: #666; }

  .file-name {
    color: #a0b8d0;
  }
</style>
