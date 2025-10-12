async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoStream = document.createElement("video");
  videoStream.srcObject = stream;
  videoStream.playsInline = true; // iOS Safari fix
  await videoStream.play();
}

// Capture frame as ImageData
function captureFrame() {
  if (!videoStream) {
    console.error("Camera not initialized!");
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoStream.videoWidth;
  canvas.height = videoStream.videoHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true }); 
  ctx.drawImage(videoStream, 0, 0);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}