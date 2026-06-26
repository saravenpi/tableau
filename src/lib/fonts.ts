import type { FontKey } from "./board.svelte";

// The three note typefaces. "sans" is Toile's bundled Goga (the classic look);
// serif and mono use polished system stacks so we ship zero extra font assets.
export const FONT_STACKS: Record<FontKey, string> = {
  sans: '"Goga", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  mono: 'ui-monospace, "SF Mono", Menlo, "Roboto Mono", monospace',
};
