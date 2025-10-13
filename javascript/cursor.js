//create the cursor and allow it to interact with the webpage
import { getClickableElements } from "./utils.js";

let prevX = window.innerWidth / 2;
let prevY = window.innerHeight / 2;
let hoverElement = null;
let hoverStart = null;
const HOVER_TIME = 1000;

const cursor = document.getElementById("cursor");

export function onResultsHandler(results) {
  const hand = results.rightHandLandmarks?.length
    ? results.rightHandLandmarks
    : results.leftHandLandmarks?.length
      ? results.leftHandLandmarks
      : null;

  if (!hand) return;

  const indexTip = hand[8];
  if (!indexTip) return;

  let x = window.innerWidth - indexTip.x * window.innerWidth;
  let y = indexTip.y * window.innerHeight;

  prevX += (x - prevX) * 0.3;
  prevY += (y - prevY) * 0.3;

  cursor.style.left = `${prevX}px`;
  cursor.style.top = `${prevY}px`;

  const clickableElements = getClickableElements();
  let hovering = false;

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

  if (!hovering) {
    hoverElement = null;
    hoverStart = null;
  }
}
