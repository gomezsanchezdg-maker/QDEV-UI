<script lang="ts">
</script>

<div class="typing-wrapper">
  <div class="avatar">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>
  <div class="dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
</div>

<style>
  .typing-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .avatar {
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
  }

  .dots {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 20px;
  }

  .dots span {
    width: 5px;
    height: 5px;
    background: #4a4a4a;
    border-radius: 50%;
    animation: bounce 1.2s ease-in-out infinite;
  }

  .dots span:nth-child(1) { animation-delay: 0s; }
  .dots span:nth-child(2) { animation-delay: 0.2s; }
  .dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); background: #4a4a4a; }
    30% { transform: translateY(-4px); background: #4d9eff; }
  }
</style>
