// any actions that happen onclick would go here

export function getClickableElements() {
  return Array.from(document.querySelectorAll(
    'button, a, input, select, textarea, [onclick]'
  ));
}
