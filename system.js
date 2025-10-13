async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoStream = document.createElement("video");
  videoStream.srcObject = stream;
  videoStream.playsInline = true; // iOS Safari fix
  await videoStream.play();
}

// Capture frame as ImageData
function captureFrame(maxSizeKB = 20) {
  if (!videoStream) {
    console.error("Camera not initialized!");
    return null;
  }

  const maxBytes = maxSizeKB * 1024;
  const originalWidth = videoStream.videoWidth;
  const originalHeight = videoStream.videoHeight;

  // Compute max number of pixels
  const maxPixels = Math.floor(maxBytes / 4);

  // Compute scale factor
  const scale = Math.min(1, Math.sqrt(maxPixels / (originalWidth * originalHeight)));

  const width = Math.floor(originalWidth * scale);
  const height = Math.floor(originalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoStream, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

async function imageDataListToBlobs(imageDataList) {
  const blobs = [];

  for (const imageData of imageDataList) {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");

    // put the ImageData onto the canvas
    ctx.putImageData(imageData, 0, 0);

    // convert to blob
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );
    blobs.push(blob);
  }

  return blobs;
}

// Show the frame on screen (for debugging)
function showImage(imageData, container) {
  // make a canvas with the *original* size
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);

  // clear container
  container.innerHTML = "";

  // wrap canvas in a responsive div or just style canvas
  canvas.style.width = "100%";   // fit container width
  canvas.style.height = "auto";  // auto adjust height
  canvas.style.display = "block"; // remove extra gaps

  container.appendChild(canvas);
}