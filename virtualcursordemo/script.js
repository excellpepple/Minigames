//define the video and  virtual cursor
const video = document.getElementById("video");
const cursor = document.getElementById("cursor");

//define starting coordinates for the cursor
let prevX = window.innerWidth / 2;
let prevY = window.innerHeight / 2;

//finds all buttons on the webpage
const buttons = document.querySelectorAll('.button');
//variables to track what button the cursor is hovering over, and for how long
let hoverButton = null;
let hoverStart = null;
//how many MS the virtual cursor needs to hover for to click
const HOVER_TIME = 1000;

// Places buttons on random spots on the page
function moveButtonRandom(btn) {
  const maxX = window.innerWidth - btn.offsetWidth;
  const maxY = window.innerHeight - btn.offsetHeight;
  btn.style.left = Math.random() * maxX + "px";
  btn.style.top = Math.random() * maxY + "px";
}

// Initially position buttons
buttons.forEach(btn => moveButtonRandom(btn));

// Instantiate the holistic version of mediapipe, including face, hands, and pose meshes.
const holistic = new Holistic({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

//find the hand's pointer fingertip, then follow with the virtual cursor
holistic.onResults(results => {
  //use right or left hand
  const hand = (results.rightHandLandmarks && results.rightHandLandmarks.length > 0)
    ? results.rightHandLandmarks
    : (results.leftHandLandmarks && results.leftHandLandmarks.length > 0)
      ? results.leftHandLandmarks
      : null;

  if (hand) {
    const indexTip = hand[8]; // pointer fingertip
    if (indexTip) {
      let x = window.innerWidth - indexTip.x * window.innerWidth; // mirror X
      let y = indexTip.y * window.innerHeight;

      prevX += (x - prevX) * 0.3;
      prevY += (y - prevY) * 0.3;

      cursor.style.left = prevX + "px";
      cursor.style.top = prevY + "px";

      // detect hovering over buttons
      let hovering = false;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (prevX > rect.left && prevX < rect.right && prevY > rect.top && prevY < rect.bottom) {
          if (hoverButton !== btn) {
            hoverButton = btn;
            hoverStart = performance.now();
          } else if (performance.now() - hoverStart >= HOVER_TIME) {
            btn.click();
            hoverStart = performance.now();
          }
          hovering = true;
        }
      });
      if (!hovering) {
        hoverButton = null;
        hoverStart = null;
      }
    }
  }
});


// start camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { video.srcObject = stream; });

//send frames to mediapipe to process in real time
async function processFrame() {
  await holistic.send({ image: video });
  requestAnimationFrame(processFrame);
}
video.onloadeddata = () => { processFrame(); }

// click handlers move buttons
buttons.forEach(btn => {
  btn.addEventListener('click', () => { moveButtonRandom(btn); });
});
