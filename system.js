async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoStream = document.createElement("video");
  videoStream.srcObject = stream;
  videoStream.playsInline = true; // iOS Safari fix
  await videoStream.play();
}

// Capture frame as ImageData
function captureFrame(maxSizeKB = 500) {
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
  const scale = Math.min(
    1,
    Math.sqrt(maxPixels / (originalWidth * originalHeight))
  );
  console.log(scale);
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
  try {
    // make a canvas with the *original* size
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);

    // clear container
    container.innerHTML = "";

    // wrap canvas in a responsive div or just style canvas
    canvas.style.width = "100%"; // fit container width
    canvas.style.height = "100%"; // auto adjust height
    canvas.style.display = "block"; // remove extra gaps

    container.appendChild(canvas);
  } catch (e) {
    console.log(e);
  }
}

function SmartSearch(search, list) {
  search = search.toLowerCase();
  const qLen = search.length;

  const distances = {};

  for (const originalWord of list) {
    const word = originalWord.toLowerCase();

    // We want the best match of ANY substring inside the word
    let best = Infinity;

    for (let start = 0; start < word.length; start++) {
      const slice = word.slice(start, start + qLen);

      // DP table (qLen × qLen)
      const dp = Array.from({ length: qLen }, () => Array(qLen).fill(0));

      // initialize
      dp[0][0] = search[0] === slice[0] ? 0 : 1;

      // first row
      for (let y = 1; y < qLen; y++) {
        dp[0][y] = dp[0][y - 1] + (search[0] === slice[y] ? 0 : 1);
      }

      // first column
      for (let x = 1; x < qLen; x++) {
        dp[x][0] = dp[x - 1][0] + (search[x] === slice[0] ? 0 : 1);
      }

      // fill DP
      for (let x = 1; x < qLen; x++) {
        for (let y = 1; y < qLen; y++) {
          const cost = search[x] === slice[y] ? 0 : 1;

          dp[x][y] = Math.min(
            dp[x - 1][y] + 1, // deletion
            dp[x][y - 1] + 1, // insertion
            dp[x - 1][y - 1] + cost // substitution
          );
        }
      }

      const finalDist = dp[qLen - 1][qLen - 1];
      if (finalDist < best) best = finalDist; // choose best substring
    }

    distances[originalWord] = best;
  }

  // sort
  const sorted = Object.entries(distances)
    .sort((a, b) => a[1] - b[1])
    .map((e) => e[0]);

  return {
    distances,
    sorted,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
