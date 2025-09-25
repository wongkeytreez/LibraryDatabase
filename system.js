
let server=null;
// Initialize camera
let videoStream = null;
let stream = null;

async function initCamera() {
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream = document.createElement("video");
    videoStream.srcObject = stream;
    videoStream.playsInline = true; // iOS Safari fix
    await videoStream.play();
    videoStream.pause(); // immediately pause to save power
  }
}

// Capture frame as ImageData
async function captureFrame() {
  if (!videoStream) {
    await initCamera();
  }

  // resume just for capture
  videoStream.play();
  await new Promise(r => videoStream.onplaying = r);

  const canvas = document.createElement("canvas");
  canvas.width = videoStream.videoWidth;
  canvas.height = videoStream.videoHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoStream, 0, 0);

  videoStream.pause(); // pause again after capture

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}


// Show the frame on screen (for debugging)
function showImage(imageData, containerId) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);

  const container = document.getElementById(containerId);
  container.innerHTML = ""; // clear old content
  container.appendChild(canvas);
}
async function imageDataListToBlobs(imageDataList, type = "image/jpeg", quality = 0.8) {
  const blobs = [];

  for (const imageData of imageDataList) {
    // Create an OffscreenCanvas (faster than regular canvas if available)
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");

    // Put ImageData on the canvas
    ctx.putImageData(imageData, 0, 0);

    // Convert canvas to Blob
    const blob = await new Promise((resolve) =>
      canvas.convertToBlob({ type, quality }).then(resolve)
    );

    blobs.push(blob);
  }

  return blobs; // array of Blobs
}
