<script lang="ts">
  let {
    canUndo,
    canRedo,
    onundo,
    onredo,
    shifted = false,
    hidden = false,
  }: {
    canUndo: boolean;
    canRedo: boolean;
    onundo: () => void;
    onredo: () => void;
    shifted?: boolean;
    hidden?: boolean;
  } = $props();
</script>

<div class="cluster" class:shifted class:hidden data-ui>
  <button
    class="circle liquid-glass"
    onclick={onundo}
    disabled={!canUndo}
    aria-label="Undo"
  >
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 6 6 6 6 0 0 1-6 6h-3" />
    </svg>
    <span class="tip">Undo <kbd>⌘Z</kbd></span>
  </button>
  <button
    class="circle liquid-glass"
    onclick={onredo}
    disabled={!canRedo}
    aria-label="Redo"
  >
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H10a6 6 0 0 0-6 6 6 6 0 0 0 6 6h3" />
    </svg>
    <span class="tip">Redo <kbd>⇧⌘Z</kbd></span>
  </button>
</div>

<style>
  .cluster {
    position: fixed;
    left: 22px;
    bottom: 24px;
    z-index: 40;
    display: flex;
    gap: 10px;
    transform: translateX(0) translateY(0);
    transition:
      transform 0.3s var(--ease-soft),
      opacity 0.3s var(--ease-soft);
  }
  .cluster.shifted {
    transform: translateX(70px);
  }
  .cluster.hidden {
    opacity: 0;
    transform: translateY(16px);
    pointer-events: none;
  }
  .cluster.shifted.hidden {
    transform: translateX(70px) translateY(16px);
  }
  .circle {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--ink);
    cursor: pointer;
    font-family: inherit;
    transition:
      transform 0.18s var(--ease-soft),
      opacity 0.18s var(--ease-soft);
  }
  .circle:hover {
    transform: scale(1.06);
  }
  .circle:active {
    transform: scale(0.92);
  }
  .circle:disabled {
    opacity: 0.35;
    cursor: default;
    transform: none;
  }
  .circle svg {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .cluster,
    .circle {
      transition: none !important;
    }
  }
</style>
