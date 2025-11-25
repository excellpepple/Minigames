//create the cursor and allow it to interact with the webpage
import { getClickableElements } from "./utils.js";

//initialize the cursor's position to be in the center of the screen
let prevX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
let prevY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

//initialize hover tracking
let hoverElement = null;
let hoverStart = null;
const HOVER_TIME = 1000;

//determine which hand is being detected
export function onResultsHandler(results) {
  // Get cursor element dynamically in case it doesn't exist yet
  const cursor = typeof document !== "undefined" ? document.getElementById("cursor") : null;
  if (!cursor) return;

  let hand = null;
  if (results.rightHandLandmarks?.length) {
    hand = results.rightHandLandmarks;
  } else if (results.leftHandLandmarks?.length) {
    hand = results.leftHandLandmarks;
  }

//no hand detected
  if (!hand) return;

  //track the index fingertip
  const indexTip = hand[8];
  if (!indexTip) return;

  //Map hand coordinates to screen coordinates
  // MediaPipe coordinates: (0,0) is top-left, (1,1) is bottom-right
  // Note: x is flipped because camera is mirrored (scaleX(-1))
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  
  // Map normalized coordinates (0-1) to pixel coordinates
  // When hand is at bottom of camera (y=1.0), cursor should be at bottom of viewport
  let x = viewportWidth - (indexTip.x * viewportWidth);
  let y = indexTip.y * viewportHeight;

  // Ensure coordinates are within viewport bounds
  // Allow cursor to go to edges (0 to viewportWidth/Height)
  x = Math.max(0, Math.min(viewportWidth, x));
  y = Math.max(0, Math.min(viewportHeight, y));

  //make cursor movement smooth
  prevX += (x - prevX);// //* 0.3;
  prevY += (y - prevY);// * 0.3;

  // Clamp smoothed position to viewport bounds
  prevX = Math.max(0, Math.min(viewportWidth, prevX));
  prevY = Math.max(0, Math.min(viewportHeight, prevY));

  //update cursor position
  // Use fixed positioning so it's relative to viewport, not document
  // Transform centers the cursor on the point (cursor is 24x24, so 12px offset)
  cursor.style.left = `${prevX}px`;
  cursor.style.top = `${prevY}px`;
  cursor.style.transform = "translate(-50%, -50%)"; // Center the cursor on the point

  //use util function to find all interactible(clickable) elements on the page
  const clickableElements = getClickableElements();
  let hovering = false;

  //detect if cursor is hovering over an interactible element, and click after 1 second
  clickableElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (prevX > rect.left && prevX < rect.right && prevY > rect.top && prevY < rect.bottom) {
      if (hoverElement !== el) {
        hoverElement = el;
        hoverStart = performance.now();
      } else if (performance.now() - hoverStart >= HOVER_TIME) {
        el.click();
        hoverStart = performance.now();
      }
      hovering = true;
    }
  });


  //if not hovering, reset hover tracking
  if (!hovering) {
    hoverElement = null;
    hoverStart = null;
  }
}
