<script lang="ts">
  import type { FontKey } from "../board.svelte";
  import { FONT_STACKS } from "../fonts";

  let {
    font = "sans",
    onpick,
  }: {
    font?: FontKey;
    onpick: (f: FontKey) => void;
  } = $props();

  const OPTIONS: { key: FontKey; label: string }[] = [
    { key: "sans", label: "Aa" },
    { key: "serif", label: "Aa" },
    { key: "mono", label: "Aa" },
  ];
</script>

<div class="fonts liquid-glass">
  {#each OPTIONS as o}
    <button
      class="font"
      class:active={font === o.key}
      style="font-family:{FONT_STACKS[o.key]}"
      title={o.key}
      onclick={() => onpick(o.key)}
    >
      {o.label}
    </button>
  {/each}
</div>

<style>
  .fonts {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
  }
  .font {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--ink-soft);
    font-size: 19px;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 0.18s var(--ease-soft),
      color 0.18s ease,
      background 0.18s ease;
  }
  .font:hover {
    transform: scale(1.1);
    color: var(--ink);
  }
  .font.active {
    color: var(--ink);
    background: rgba(40, 38, 32, 0.1);
  }
</style>
