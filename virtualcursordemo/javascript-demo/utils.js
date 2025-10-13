
//handles what the demo buttons do on click, which is move around the webpage
export function moveButtonRandom(btn) {
  const maxX = window.innerWidth - btn.offsetWidth;
  const maxY = window.innerHeight - btn.offsetHeight;
  btn.style.left = Math.random() * maxX + "px";
  btn.style.top = Math.random() * maxY + "px";
}

export function getClickableElements() {
  return Array.from(document.querySelectorAll(
    'button, a, input, select, textarea, [onclick]'
  ));
}
