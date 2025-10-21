export async function startCamera(videoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
  return new Promise(resolve => {
    videoElement.onloadeddata = () => resolve();
  });
}
