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

function SmartSearch(SearchString, ListOfResults, presetDistances = {}) {
  const Distances = {}; // word → DP table

  ListOfResults.forEach((word, index) => {
    word = word.toLowerCase();
    // skip duplicates
    if (Distances[word]) return;

    const Q = SearchString.toLowerCase();
    const maxLen = Q.length;

    // make DP table only limited to Q.length × Q.length
    const dp = Array(maxLen)
      .fill(0)
      .map(() => Array(maxLen).fill(0));
    // if preset exists, use it
    if (presetDistances[word]) {
      Distances[word] = presetDistances[word];
    }
    // initialize first cell
    dp[0][0] = Q[0] === word[0] ? 0 : 1;

    // first row
    for (let y = 1; y < maxLen; y++) {
      const charWord = word[y] ?? ""; // avoid undefined
      dp[0][y] = dp[0][y - 1] + (Q[0] === charWord ? 0 : 1);
    }

    // first column
    for (let x = 1; x < maxLen; x++) {
      const charWord = word[0] ?? "";
      dp[x][0] = dp[x - 1][0] + (Q[x] === charWord ? 0 : 1);
    }

    // fill the rest
    for (let x = 1; x < maxLen; x++) {
      dp.splice(maxLen, dp.length - maxLen);
      for (let y = 1; y < maxLen; y++) {
        dp[x].splice(maxLen, dp[x].length - maxLen);
        const qc = Q[x];
        const wc = word[y] ?? ""; // safe if word is shorter

        const cost = qc === wc ? 0 : 1;

        dp[x][y] = Math.min(
          dp[x - 1][y] + 1, // deletion
          dp[x][y - 1] + 1, // insertion
          dp[x - 1][y - 1] + cost // substitution
        );
      }
    }

    Distances[ListOfResults[index]] = dp;
  });

  // extract final distances
  const finalDistances = {};
  for (const word in Distances) {
    const dp = Distances[word];

    const lastX = dp.length - 1;
    const lastY = dp[lastX].length - 1;

    finalDistances[word] = dp[lastX][lastY];
  }

  // sort by shortest distance
  const sortedNames = Object.entries(finalDistances)
    .sort((a, b) => a[1] - b[1])
    .map((e) => e[0]);

  return {
    map: Distances,
    distances: finalDistances,
    sorted: sortedNames,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
