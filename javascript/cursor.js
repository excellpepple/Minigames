//create the cursor and allow it to interact with the webpage
import { getClickableElements } from "./utils.js";

//initialize the cursor's position to be in the center of the screen
let prevX = window.innerWidth / 2;
let prevY = window.innerHeight / 2;

//initialize hover tracking
let hoverElement = null;
let hoverStart = null;
const HOVER_TIME = 1000;

const cursor = document.getElementById("cursor");

//determine which hand is being detected
export function onResultsHandler(results) {
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
  let x = window.innerWidth - indexTip.x * window.innerWidth;
  let y = indexTip.y * window.innerHeight;


  //make cursor movement smooth
  prevX += (x - prevX) * 0.3;
  prevY += (y - prevY) * 0.3;

  //update cursor position
  cursor.style.left = `${prevX}px`;
  cursor.style.top = `${prevY}px`;

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
