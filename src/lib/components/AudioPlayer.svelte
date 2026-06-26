<script lang="ts">
  import { onMount } from "svelte";
  import WaveformScrubber from "./WaveformScrubber.svelte";

  let {
    src,
    name,
    onfail,
  }: { src: string; name: string; onfail?: () => void } = $props();

  let audio = $state<HTMLAudioElement | null>(null);
  let playing = $state(false);
  let cur = $state(0);
  let dur = $state(0);
  let objectUrl = $state<string | null>(null);
  const pct = $derived(dur > 0 ? Math.min(100, (cur / dur) * 100) : 0);

  let raf = 0;
  let lastNow = 0;
  let lastReal = 0;

  function render() {
    if (audio) {
      if (playing) {
        const now = performance.now();
        const dt = lastNow ? Math.min(0.25, (now - lastNow) / 1000) : 0;
        lastNow = now;
        const real = audio.currentTime;
        if (real < lastReal - 0.05) {
          cur = real;
        } else {
          let next = cur + dt * (audio.playbackRate || 1);
          if (next < real)
            next = real;
          else if (next > real + 0.5) next = real + 0.5;
          if (dur) next = Math.min(next, dur);
          cur = Math.max(cur, next);
        }
        lastReal = real;
      } else {
        const real = audio.currentTime;
        cur = Math.abs(cur - real) < 0.01 ? real : cur + (real - cur) * 0.22;
        lastNow = 0;
      }
    }
  }

  function frame() {
    render();
    const real = audio?.currentTime ?? cur;
    if (playing || Math.abs(cur - real) > 0.01) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
    }
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  $effect(() => {
    playing;
    kick();
  });

  $effect(() => {
    let url: string | null = null;
    let cancelled = false;
    fetch(src)
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        objectUrl = url;
      })
      .catch(() => onfail?.());
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      objectUrl = null;
    };
  });

  function toggle() {
    const a = audio;
    if (!a || !objectUrl) return;
    if (a.paused) a.play().catch(() => onfail?.());
    else a.pause();
  }

  function seek(frac: number) {
    const a = audio;
    if (!a || !dur) return;
    a.currentTime = frac * dur;
    cur = a.currentTime;
    lastNow = 0;
  }

  function fmt(t: number): string {
    if (!isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  onMount(() => () => {
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<div class="player note-audio" data-src={src} data-name={name}>
  <div class="row">
    <button
      class="play audio-ctl"
      onclick={toggle}
      aria-label={playing ? "Pause" : "Play"}
    >
      {#if playing}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      {/if}
    </button>
    <span class="name">{name}</span>
    <span class="time">{fmt(cur)}</span>
  </div>

  <div class="bar-wrap audio-ctl">
    <WaveformScrubber {pct} {playing} onseek={seek} />
  </div>

  <audio
    bind:this={audio}
    src={objectUrl}
    onplay={() => {
      playing = true;
      lastNow = 0;
    }}
    onpause={() => {
      playing = false;
    }}
    onended={() => {
      playing = false;
      cur = dur;
    }}
    onloadedmetadata={() => (dur = audio?.duration ?? 0)}
    ondurationchange={() => (dur = audio?.duration ?? 0)}
    onerror={() => onfail?.()}
  ></audio>
</div>

<style>
  .player {
    display: flex;
    flex-direction: column;
    gap: 13px;
    width: 100%;
    box-sizing: border-box;
    margin: 6px 0;
    padding: 16px;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.55);
    box-shadow: inset 0 0 0 1px rgba(40, 38, 32, 0.12);
    color: var(--ink);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .play {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 50%;
    background: var(--ink);
    color: #fff;
    cursor: pointer;
    transition: transform 0.15s var(--ease-soft);
  }
  .play:hover {
    transform: scale(1.07);
  }
  .play:active {
    transform: scale(0.92);
  }
  .name {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 17px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .time {
    flex: 0 0 auto;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    opacity: 0.55;
  }

  .bar-wrap {
    width: 100%;
  }
</style>
