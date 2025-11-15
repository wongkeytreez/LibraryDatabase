const faceapi = require("@vladmandic/face-api");
const { Canvas, Image, ImageData, loadImage } = require("canvas");
const path = require("path");

faceapi.env.monkeyPatch({ Canvas, Image, ImageData }); // enables Node.js use

const modelPath = path.join(__dirname, "models");

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  console.log("Face detection model loaded ✅");
}

async function findHighestFaceChance(imageBuffers) {
  const results = await Promise.all(
    imageBuffers.map(async (buffer, index) => {
      const img = await loadImage(buffer);
      const detections = await faceapi.detectAllFaces(img);
      let maxScore = 0;
      for (const det of detections)
        if (det.score > maxScore) maxScore = det.score;
      return { index, maxScore };
    }),
  );

  const best = results.reduce(
    (prev, curr) => (curr.maxScore > prev.maxScore ? curr : prev),
    { index: null, maxScore: 0 },
  );

  return best.index;
}

loadModels();
module.exports = { findHighestFaceChance };
