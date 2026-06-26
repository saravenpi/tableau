<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let { onclose }: { onclose: () => void } = $props();

  type Shortcut = { label: string; keys: string[] };
  type Group = { title: string; items: Shortcut[] };

  const groups: Group[] = [
    {
      title: "Navigate",
      items: [
        { label: "Pan the canvas", keys: ["Space-drag", "middle-drag"] },
        { label: "Zoom in / out", keys: ["+", "−"] },
        { label: "Fit everything", keys: ["⇧1"] },
        { label: "Fit selection", keys: ["⇧2"] },
        { label: "Search", keys: ["⌘K"] },
      ],
    },
    {
      title: "Create",
      items: [
        { label: "New colored note", keys: ["1", "–", "6"] },
        { label: "New text note", keys: ["T"] },
        { label: "Add a file", keys: ["F"] },
        { label: "Draw mode", keys: ["D"] },
      ],
    },
    {
      title: "Select & edit",
      items: [
        { label: "Select a zone", keys: ["drag empty canvas"] },
        { label: "Move selection", keys: ["drag selected item"] },
        { label: "Delete selection", keys: ["⌫"] },
        { label: "Undo / redo", keys: ["⌘Z", "⌘⇧Z"] },
      ],
    },
    {
      title: "Help",
      items: [{ label: "This cheatsheet", keys: ["?"] }],
    },
  ];

  function isKey(token: string): boolean {
    return !["–", "/", "drag empty canvas", "drag selected item"].includes(
      token,
    );
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="cs-backdrop"
  data-ui
  onpointerdown={onclose}
  transition:fade={{ duration: 160, easing: cubicOut }}
></div>

<div
  class="cs-panel liquid-glass"
  data-ui
  role="dialog"
  aria-modal="true"
  aria-label="Keyboard shortcuts"
  transition:scale={{ duration: 200, start: 0.96, opacity: 0, easing: cubicOut }}
>
  <button class="cs-close" onclick={onclose} aria-label="Close">
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  </button>

  <h2 class="cs-title">Keyboard shortcuts</h2>

  <div class="cs-grid">
    {#each groups as group (group.title)}
      <section class="cs-group">
        <h3 class="cs-group-title">{group.title}</h3>
        <ul class="cs-list">
          {#each group.items as item (item.label)}
            <li class="cs-row">
              <span class="cs-label">{item.label}</span>
              <span class="cs-keys">
                {#each item.keys as token}
                  {#if isKey(token)}
                    <kbd>{token}</kbd>
                  {:else}
                    <span class="cs-sep">{token}</span>
                  {/if}
                {/each}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</div>

<style>
  .cs-backdrop {
    position: fixed;
    inset: 0;
    z-index: 110;
    background: rgba(247, 246, 242, 0.32);
    -webkit-backdrop-filter: blur(7px) saturate(115%);
    backdrop-filter: blur(7px) saturate(115%);
  }

  .cs-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 111;
    width: min(680px, 90vw);
    max-height: 86vh;
    overflow-y: auto;
    padding: 26px 30px 30px;
    border-radius: 22px;
    box-shadow: 0 22px 60px rgba(40, 38, 32, 0.24);
  }

  .cs-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 50%;
    background: rgba(40, 38, 32, 0.06);
    color: var(--ink-soft);
    cursor: pointer;
    transition:
      background 0.16s var(--ease-soft),
      color 0.16s var(--ease-soft),
      transform 0.16s var(--ease-soft);
  }
  .cs-close:hover {
    background: rgba(40, 38, 32, 0.12);
    color: var(--ink);
  }
  .cs-close:active {
    transform: scale(0.9);
  }
  .cs-close svg {
    display: block;
  }

  .cs-title {
    margin: 0 0 20px;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .cs-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 38px;
  }
  @media (max-width: 540px) {
    .cs-grid {
      grid-template-columns: 1fr;
    }
  }

  .cs-group-title {
    margin: 0 0 9px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-soft);
  }

  .cs-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cs-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .cs-label {
    font-size: 14px;
    color: var(--ink);
  }

  .cs-keys {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  .cs-sep {
    font-size: 12px;
    color: var(--ink-soft);
  }

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 7px;
    background: var(--paper);
    border: 1px solid rgba(40, 38, 32, 0.16);
    box-shadow:
      0 1px 0 rgba(40, 38, 32, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    color: var(--ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .cs-backdrop,
    .cs-panel,
    .cs-close {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
