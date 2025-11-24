// Simple event system to broadcast MediaPipe landmark updates
// so multiple parts of your app (like Phaser or UI) can listen.

const listeners = new Set();

/**
 * Subscribe to landmark updates
 * @param {Function} callback - gets called with an array of landmarks
 * @returns {Function} unsubscribe
 */
export function onLandmarks(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback); // unsubscribe helper
}

/**
 * Broadcast landmarks to all subscribers
 * @param {Array} landmarks - Array of objects: { name, x, y, z, visibility }
 */
export function emitLandmarks(landmarks) {
  for (const callback of listeners) {
    callback(landmarks);
  }
}

