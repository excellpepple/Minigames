export function initHoverClick(cursorSelector = "#cursor", dwellMs = 600) {
  //retrieve the cursor
  const cursorEl = document.querySelector(cursorSelector);
  if (!cursorEl) return () => {};

  
  let rafId = 0; //for request animation frame
  //last interactible object the cursor was on
  let currentClickable = null; 
  let hoverStartTime = 0;

  //checks if an element is clickable
  const isClickable = (el) =>
    !!(el?.matches && el.matches("button, a, [data-clickable], [role='button']"));

    //find clickable elements nearest to the cursor
  const getClickableAncestor = (el) => {
    while (el) {
      if (isClickable(el)) return el;
      el = el.parentElement;
    }
    return null;
  };

  //checks to see if the cursor is hovering over a clickable element, then clicks after 600ms
  //loop runs every frame
  const loop = () => {
    try {
      const rect = cursorEl.getBoundingClientRect();
      const cursorCenterX = rect.left + rect.width / 2;
      const cursorCenterY = rect.top + rect.height / 2;

      let hoveredElement = document.elementFromPoint(cursorCenterX, cursorCenterY);
      const clickable = getClickableAncestor(hoveredElement);
      const now = performance.now();

      //hover timer, which resets if on a new element
      if (clickable !== currentClickable) {
        currentClickable = clickable;
        hoverStartTime = now;
      } else if (clickable && now - hoverStartTime >= dwellMs) {
        clickable.click?.();

        //prevents multiple clicks in a row on the same element by adding a 350ms timer after the last click
        hoverStartTime = now + 1e9;
        setTimeout(() => { hoverStartTime = performance.now(); }, 350);
      }
    } catch {}
    //get new frame, continuing the loop
    rafId = requestAnimationFrame(loop);
  };

  //stop the loop
  rafId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(rafId);
}
