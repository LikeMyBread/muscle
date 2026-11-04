export function runHorizontalScrollHeuristicInBrowser(options?: { rootSelector?: string }): { ok: boolean; reason?: string } {
  const el = document.querySelector(options?.rootSelector ?? 'body');
  if (!el) return { ok: true };
  const ok = el.scrollWidth <= el.clientWidth;
  return { ok, reason: ok ? undefined : `scrollWidth (${el.scrollWidth}) > clientWidth (${el.clientWidth})` };
}
