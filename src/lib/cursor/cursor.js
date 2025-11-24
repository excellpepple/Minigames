//create the cursor and allow it to interact with the webpage

//initialize the cursor's position to be in the center of the screen
let prevX = window.innerWidth / 2;
let prevY = window.innerHeight / 2;

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
  prevX += (x - prevX) * 0.5;
  prevY += (y - prevY) * 0.5;

  //update cursor position
  cursor.style.left = `${prevX}px`;
  cursor.style.top = `${prevY}px`;

}
