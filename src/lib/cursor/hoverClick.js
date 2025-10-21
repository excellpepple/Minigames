export function initHoverClick(cursorSelector = "#cursor", dwellMs = 600) {
  const cursorEl = document.querySelector(cursorSelector);
  if (!cursorEl) return () => {};

  let rafId = 0;
  let lastTarget = null;
  let lastStart = 0;

  //checks if an element is clickable
  const isClickable = (el) =>
    !!(el?.matches && el.matches("button, a, [data-clickable], [role='button']"));

    //find all clickable elements
  const findClickable = (el) => {
    while (el) {
      if (isClickable(el)) return el;
      el = el.parentElement;
    }
    return null;
  };

  //if hovering over a clickable element, start hover timer, and then click.
  const loop = () => {
    try {
      const rect = cursorEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let target = document.elementFromPoint(cx, cy);
      const clickable = findClickable(target);
      const now = performance.now();

      if (clickable !== lastTarget) {
        lastTarget = clickable;
        lastStart = now;
      } else if (clickable && now - lastStart >= dwellMs) {
        clickable.click?.();
        lastStart = now + 1e9;
        setTimeout(() => { lastStart = performance.now(); }, 350);
      }
    } catch {}
    //get new frame
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(rafId);
}
