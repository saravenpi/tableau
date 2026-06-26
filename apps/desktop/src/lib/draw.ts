export type Pt = { x: number; y: number };

const r = (n: number) => Math.round(n * 100) / 100;

export function simplify(points: Pt[], min = 1.2): Pt[] {
  if (points.length <= 2) return points;
  const out: Pt[] = [points[0]];
  const min2 = min * min;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const last = out[out.length - 1];
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    if (dx * dx + dy * dy >= min2) out.push(p);
  }
  out.push(points[points.length - 1]);
  return out;
}

export function smoothPath(points: Pt[]): string {
  const p = points;
  if (p.length === 0) return "";
  if (p.length === 1) return `M${r(p[0].x)},${r(p[0].y)}l0.01,0`;
  if (p.length === 2)
    return `M${r(p[0].x)},${r(p[0].y)}L${r(p[1].x)},${r(p[1].y)}`;
  let d = `M${r(p[0].x)},${r(p[0].y)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2;
    const my = (p[i].y + p[i + 1].y) / 2;
    d += `Q${r(p[i].x)},${r(p[i].y)} ${r(mx)},${r(my)}`;
  }
  const e = p[p.length - 1];
  return d + `L${r(e.x)},${r(e.y)}`;
}

type Seg = { cmd: string; nums: number[] };

function parsePath(d: string): Seg[] {
  const segs: Seg[] = [];
  const cmdRe = /([MLQCTSAHVZ])([^MLQCTSAHVZ]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = cmdRe.exec(d))) {
    const nums = (m[2].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    segs.push({ cmd: m[1], nums });
  }
  return segs;
}

function offsetNums(cmd: string, nums: number[], dx: number, dy: number): number[] {
  const c = cmd.toUpperCase();
  if (cmd !== c || c === "Z") return nums;
  const out = nums.slice();
  if (c === "H") {
    for (let i = 0; i < out.length; i++) out[i] += dx;
    return out;
  }
  if (c === "V") {
    for (let i = 0; i < out.length; i++) out[i] += dy;
    return out;
  }
  if (c === "A") {
    for (let i = 0; i + 6 < out.length; i += 7) {
      out[i + 5] += dx;
      out[i + 6] += dy;
    }
    return out;
  }
  for (let i = 0; i + 1 < out.length; i += 2) {
    out[i] += dx;
    out[i + 1] += dy;
  }
  return out;
}

function fmtSeg(cmd: string, nums: number[]): string {
  const c = cmd.toUpperCase();
  if (c === "Z") return cmd;
  if (c === "H" || c === "V") return cmd + nums.map(r).join(" ");
  if (c === "A") {
    const groups: string[] = [];
    for (let i = 0; i + 6 < nums.length; i += 7) {
      const g = nums.slice(i, i + 7).map(r);
      groups.push(`${g[0]} ${g[1]} ${g[2]} ${g[3]} ${g[4]} ${g[5]},${g[6]}`);
    }
    return cmd + groups.join(" ");
  }
  const pairs: string[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2)
    pairs.push(`${r(nums[i])},${r(nums[i + 1])}`);
  return cmd + pairs.join(" ");
}

export function translatePath(d: string, dx: number, dy: number): string {
  return parsePath(d)
    .map(({ cmd, nums }) => fmtSeg(cmd, offsetNums(cmd, nums, dx, dy)))
    .join("");
}

export function pathBBox(d: string): { x: number; y: number; w: number; h: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let cx = 0;
  let cy = 0;
  const add = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  for (const { cmd, nums } of parsePath(d)) {
    const c = cmd.toUpperCase();
    const rel = cmd !== c;
    if (c === "Z") continue;
    if (c === "H") {
      for (const n of nums) {
        cx = rel ? cx + n : n;
        add(cx, cy);
      }
      continue;
    }
    if (c === "V") {
      for (const n of nums) {
        cy = rel ? cy + n : n;
        add(cx, cy);
      }
      continue;
    }
    if (c === "A") {
      const bx = cx;
      const by = cy;
      for (let i = 0; i + 6 < nums.length; i += 7) {
        const x = rel ? bx + nums[i + 5] : nums[i + 5];
        const y = rel ? by + nums[i + 6] : nums[i + 6];
        add(x, y);
        cx = x;
        cy = y;
      }
      continue;
    }
    const bx = cx;
    const by = cy;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = rel ? bx + nums[i] : nums[i];
      const y = rel ? by + nums[i + 1] : nums[i + 1];
      add(x, y);
      cx = x;
      cy = y;
    }
  }
  if (minX === Infinity) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
