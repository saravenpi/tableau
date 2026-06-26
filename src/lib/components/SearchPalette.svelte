<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Note } from "$lib/board.svelte";

  let {
    notes,
    onpick,
    onclose,
  }: {
    notes: Note[];
    onpick: (id: string) => void;
    onclose: () => void;
  } = $props();

  let query = $state("");
  let active = $state(0);
  let input = $state<HTMLInputElement | null>(null);

  $effect(() => {
    input?.focus();
  });

  function label(text: string): string {
    let s = (text ?? "")
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt) => alt || "Image")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, (_m, lbl) => lbl || "Link")
      .replace(/^\s*[#>*\-]+\s*/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!s) s = "Untitled note";
    return s.length > 80 ? s.slice(0, 80).trimEnd() + "…" : s;
  }

  const entries = $derived(
    notes.map((n) => ({ note: n, label: label(n.text) })),
  );

  const results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    let list = entries;
    if (q) {
      list = entries.filter(
        (e) =>
          e.note.text.toLowerCase().includes(q) ||
          e.label.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b.note.z - a.note.z).slice(0, 50);
  });

  $effect(() => {
    query;
    active = 0;
  });

  $effect(() => {
    if (active >= results.length) active = Math.max(0, results.length - 1);
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onclose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) active = (active + 1) % results.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length)
        active = (active - 1 + results.length) % results.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) onpick(hit.note.id);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="search-backdrop"
  data-ui
  onpointerdown={onclose}
  transition:fade={{ duration: 160 }}
></div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="palette liquid-glass"
  data-ui
  transition:fade={{ duration: 160 }}
  onkeydown={onKeyDown}
>
  <input
    bind:this={input}
    bind:value={query}
    class="search-input"
    type="text"
    placeholder="Search notes…"
    autocomplete="off"
    spellcheck="false"
  />

  {#if results.length}
    <div class="results">
      {#each results as r, i (r.note.id)}
        <button
          class="result"
          class:active={i === active}
          onmouseenter={() => (active = i)}
          onclick={() => onpick(r.note.id)}
        >
          {#if r.note.color === "transparent"}
            <span class="swatch text-glyph">T</span>
          {:else}
            <span class="swatch" style="background:{r.note.color}"></span>
          {/if}
          <span class="result-label">{r.label}</span>
        </button>
      {/each}
    </div>
  {:else}
    <div class="empty">No matching notes</div>
  {/if}
</div>

<style>
  .search-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(40, 38, 32, 0.04);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }

  .palette {
    position: fixed;
    top: 14vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 101;
    width: min(560px, 86vw);
    max-width: 560px;
    padding: 14px 16px;
    border-radius: 18px;
    box-shadow: 0 18px 48px rgba(40, 38, 32, 0.2);
  }

  .search-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 17px;
    color: var(--ink);
    padding: 6px 6px 10px;
  }
  .search-input::placeholder {
    color: var(--ink-soft);
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 46vh;
    overflow-y: auto;
    margin-top: 4px;
  }

  .result {
    display: flex;
    align-items: center;
    gap: 11px;
    height: 40px;
    padding: 0 10px;
    border: none;
    border-radius: 11px;
    background: transparent;
    font-family: inherit;
    font-size: 15px;
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    transition: background 0.12s var(--ease-soft);
  }
  .result.active {
    background: rgba(40, 38, 32, 0.07);
  }

  .swatch {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    border-radius: 5px;
    box-shadow: inset 0 0 0 1px rgba(40, 38, 32, 0.1);
  }
  .text-glyph {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    box-shadow: inset 0 0 0 1px rgba(40, 38, 32, 0.22);
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-soft);
    line-height: 1;
  }

  .result-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty {
    padding: 14px 10px 8px;
    font-size: 14px;
    color: var(--ink-soft);
  }

  @media (prefers-reduced-motion: reduce) {
    .search-backdrop,
    .palette,
    .result {
      transition: none !important;
    }
  }
</style>
