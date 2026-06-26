const YT_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

export function isBareUrl(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\/\S+$/i.test(t);
}

export function youtubeId(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (!YT_HOSTS.has(host)) return null;

  let id = "";
  if (host === "youtu.be") {
    id = u.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (u.searchParams.get("v")) {
    id = u.searchParams.get("v") ?? "";
  } else {
    const [head, next] = u.pathname.split("/").filter(Boolean);
    if (head && ["shorts", "embed", "v", "live"].includes(head)) id = next ?? "";
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

export function safeExternal(url: string): boolean {
  return /^(https?|mailto):/i.test(url.trim());
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
