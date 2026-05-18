<script lang="ts">
  import { tick } from 'svelte';
  import { chatStore } from './store.svelte';
  import MessageBubble from './MessageBubble.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  import ChatInput from './ChatInput.svelte';
  import ChangesPanel from './ChangesPanel.svelte';

  let messagesEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    const _ = chatStore.messages.length;
    const __ = chatStore.isLoading;
    tick().then(() => {
      if (messagesEl) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    });
  });
</script>

<div class="chat-panel">
  <!-- Header tabs -->
  <div class="tabs">
    <button
      class="tab {chatStore.activeTab === 'session' ? 'active' : ''}"
      type="button"
      onclick={() => chatStore.setActiveTab('session')}
    >
      Session
    </button>
    <button
      class="tab {chatStore.activeTab === 'changes' ? 'active' : ''}"
      type="button"
      onclick={() => chatStore.setActiveTab('changes')}
    >
      Changes
      <span class="badge">4</span>
    </button>

    <div class="tab-spacer"></div>

    <button class="icon-tab" type="button" title="New session">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
    <button class="icon-tab" type="button" title="Options">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="5" r="1" fill="currentColor"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <circle cx="12" cy="19" r="1" fill="currentColor"/>
      </svg>
    </button>
  </div>

  <!-- Content -->
  {#if chatStore.activeTab === 'session'}
    <div class="messages" bind:this={messagesEl}>
      {#each chatStore.messages as message (message.id)}
        <MessageBubble {message} />
      {/each}

      {#if chatStore.isLoading}
        <TypingIndicator />
      {/if}
    </div>
  {:else}
    <ChangesPanel />
  {/if}

  <!-- Input -->
  <ChatInput />
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #1e1e1e;
    overflow: hidden;
  }

  .tabs {
    display: flex;
    align-items: center;
    height: 38px;
    border-bottom: 1px solid #2e2e2e;
    background: #1a1a1a;
    flex-shrink: 0;
    padding: 0 6px;
    gap: 1px;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 12px;
    height: 100%;
    border: none;
    background: none;
    color: #666;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s;
    position: relative;
    top: 1px;
  }

  .tab:hover {
    color: #a0a0a0;
  }

  .tab.active {
    color: #e0e0e0;
    border-bottom-color: #4d9eff;
  }

  .badge {
    background: #2a3a50;
    color: #79c0ff;
    font-size: 9px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
  }

  .tab-spacer {
    flex: 1;
  }

  .icon-tab {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: #555;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }

  .icon-tab:hover {
    background: #2a2a2a;
    color: #a0a0a0;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px 0;
  }
</style>
