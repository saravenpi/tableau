<script lang="ts">
  import { onMount } from "svelte";

  let {
    pct,
    playing,
    onseek,
  }: { pct: number; playing: boolean; onseek: (frac: number) => void } =
    $props();

  const VB_W = 200;
  const MID = 12;
  const LAMBDA = 34;
  const AMP = 4.5;
  const SPEED = 0.0045;
  const STEP = 3;

  let wavePath = $state(`M0 ${MID} L0 ${MID}`);
  let tipY = $state(MID);
  const thumbTop = $derived((tipY / 24) * 100);

  let phase = 0;
  let amp = 0;
  let raf = 0;
  let prev = 0;

  const waveAt = (x: number) =>
    MID + amp * Math.sin((2 * Math.PI * x) / LAMBDA + phase);

  function buildWave() {
    const playX = (pct / 100) * VB_W;
    let d = `M0 ${waveAt(0).toFixed(2)}`;
    for (let x = STEP; x < playX; x += STEP)
      d += ` L${x.toFixed(1)} ${waveAt(x).toFixed(2)}`;
    d += ` L${playX.toFixed(2)} ${waveAt(playX).toFixed(2)}`;
    wavePath = d;
    tipY = waveAt(playX);
  }

  function frame(t: number) {
    const dt = prev ? Math.min(48, t - prev) : 16;
    prev = t;
    if (playing) phase += SPEED * dt;
    const target = playing ? AMP : 0;
    amp += (target - amp) * Math.min(1, dt / 120);
    buildWave();
    if (playing || Math.abs(amp - target) > 0.02) {
      raf = requestAnimationFrame(frame);
    } else {
      amp = target;
      buildWave();
      raf = 0;
      prev = 0;
    }
  }

  function kick() {
    if (!raf) {
      prev = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  $effect(() => {
    playing;
    kick();
  });

  $effect(() => {
    pct;
    if (!raf) buildWave();
  });

  function seekTo(e: PointerEvent, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    onseek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  }

  function down(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    seekTo(e, el);
  }

  function move(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) seekTo(e, el);
  }

  onMount(() => () => {
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<div
  class="bar"
  onpointerdown={down}
  onpointermove={move}
  role="slider"
  aria-label="Seek"
  aria-valuenow={Math.round(pct)}
  aria-valuemin="0"
  aria-valuemax="100"
  tabindex="-1"
>
  <span class="track" style="clip-path: inset(0 0 0 calc({pct}% + 4px))"></span>
  <div class="fg">
    <svg class="wave" viewBox="0 0 {VB_W} 24" preserveAspectRatio="none">
      <path d={wavePath} vector-effect="non-scaling-stroke" />
    </svg>
  </div>
  <span class="thumb" style="left:{pct}%; top:{thumbTop}%"></span>
</div>

<style>
  .bar {
    position: relative;
    height: 26px;
    cursor: pointer;
    touch-action: none;
  }
  .track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 3px;
    transform: translateY(-50%);
    border-radius: 99px;
    background: rgba(40, 38, 32, 0.22);
  }
  .fg {
    position: absolute;
    inset: 0;
  }
  .wave {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    fill: none;
    stroke: var(--ink);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .thumb {
    position: absolute;
    width: 11px;
    height: 11px;
    margin: -5.5px 0 0 -5.5px;
    border-radius: 50%;
    background: var(--ink);
    box-shadow: 0 1px 3px rgba(40, 38, 32, 0.3);
    pointer-events: none;
  }
</style>
