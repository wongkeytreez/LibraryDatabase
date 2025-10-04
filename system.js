
let server=null;
// Initialize camera
let videoStream = null;
let stream = null;

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
}function createManualCropper(container, imageData) {
  // source canvas (full-resolution)
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = imageData.width;
  srcCanvas.height = imageData.height;
  srcCanvas.getContext("2d").putImageData(imageData, 0, 0);
  const imgURL = srcCanvas.toDataURL();

  // wrapper
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "relative",
    display: "inline-block",
    userSelect: "none",
    touchAction: "none" // <- prevents page panning on touch
  });
  container.appendChild(wrapper);

  // image (visible)
  const img = document.createElement("img");
  img.src = imgURL;
  Object.assign(img.style, {
    display: "block",
    maxWidth: "100%",
    height: "auto",
    width: "100%",
     touchAction: "none",
    pointerEvents: "none" 
  });
  wrapper.appendChild(img);

  // crop box
  const cropBox = document.createElement("div");
  Object.assign(cropBox.style, {
    position: "absolute",
    border: "2px dashed lime",
    left: "50px",
    top: "50px",
    width: "120px",
    height: "120px",
    touchAction: "none" // also on the box
  });
  wrapper.appendChild(cropBox);

  // handles (bigger for touch)
  const positions = ["nw","ne","sw","se"];
  const handles = {};
  positions.forEach(pos => {
    const h = document.createElement("div");
    h.dataset.pos = pos;
    Object.assign(h.style, {
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      background: "rgba(255,0,0,0.9)",
      position: "absolute",
      zIndex: 5,
      touchAction: "none",
      display: "block"
    });
    // cursor hints (desktop)
    if (pos === "nw" || pos === "se") h.style.cursor = "nwse-resize";
    else h.style.cursor = "nesw-resize";
    cropBox.appendChild(h);
    handles[pos] = h;
  });

  function updateHandles() {
    handles.nw.style.left = "0"; handles.nw.style.top = "0"; handles.nw.style.transform = "translate(-50%,-50%)";
    handles.ne.style.right = "0"; handles.ne.style.top = "0"; handles.ne.style.transform = "translate(50%,-50%)";
    handles.sw.style.left = "0"; handles.sw.style.bottom = "0"; handles.sw.style.transform = "translate(-50%,50%)";
    handles.se.style.right = "0"; handles.se.style.bottom = "0"; handles.se.style.transform = "translate(50%,50%)";
  }
  updateHandles();

  // pointer-based drag/resize (works for mouse & touch)
  let activePointerId = null;
  let action = null; // "move" or "resize"
  let resizePos = null;
  let startPoint = {x:0,y:0};
  let startRect = null;

  cropBox.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    cropBox.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;
    startPoint = { x: e.clientX, y: e.clientY };
    startRect = cropBox.getBoundingClientRect();

    const hit = e.target.closest("[data-pos]");
    if (hit && hit.dataset.pos) {
      action = "resize";
      resizePos = hit.dataset.pos; // "nw","ne","sw","se"
    } else {
      action = "move";
      resizePos = null;
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (activePointerId !== e.pointerId) return;
    e.preventDefault();

    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    const wrap = wrapper.getBoundingClientRect();

    if (action === "move") {
      let left = startRect.left + dx - wrap.left;
      let top  = startRect.top  + dy - wrap.top;
      // clamp inside wrapper
      left = Math.max(0, Math.min(left, wrap.width - startRect.width));
      top  = Math.max(0, Math.min(top, wrap.height - startRect.height));
      cropBox.style.left = Math.round(left) + "px";
      cropBox.style.top  = Math.round(top)  + "px";
    } else if (action === "resize") {
      let newLeft   = startRect.left;
      let newTop    = startRect.top;
      let newWidth  = startRect.width;
      let newHeight = startRect.height;

      if (resizePos.includes("n")) {
        newTop    = startRect.top + dy;
        newHeight = startRect.height - dy;
      }
      if (resizePos.includes("s")) {
        newHeight = startRect.height + dy;
      }
      if (resizePos.includes("w")) {
        newLeft  = startRect.left + dx;
        newWidth = startRect.width - dx;
      }
      if (resizePos.includes("e")) {
        newWidth = startRect.width + dx;
      }

      // convert to wrapper coords and clamp
      let relLeft = newLeft - wrap.left;
      let relTop  = newTop - wrap.top;
      const minSize = 24;
      newWidth = Math.max(minSize, newWidth);
      newHeight = Math.max(minSize, newHeight);
      relLeft = Math.max(0, relLeft);
      relTop  = Math.max(0, relTop);
      if (relLeft + newWidth > wrap.width)  newWidth  = wrap.width - relLeft;
      if (relTop  + newHeight > wrap.height) newHeight = wrap.height - relTop;

      cropBox.style.left = Math.round(relLeft) + "px";
      cropBox.style.top  = Math.round(relTop)  + "px";
      cropBox.style.width  = Math.round(newWidth)  + "px";
      cropBox.style.height = Math.round(newHeight) + "px";
      updateHandles();
    }
  }, { passive: false });

  window.addEventListener("pointerup", (e) => {
    if (activePointerId !== e.pointerId) return;
    try { cropBox.releasePointerCapture(e.pointerId); } catch {}
    activePointerId = null;
    action = null;
    resizePos = null;
  });

  // Export cropped blob (clamped + rounded)
  wrapper.getCroppedImageBlob = () => {
    const box = cropBox.getBoundingClientRect();
    const wrap = wrapper.getBoundingClientRect();
    const dispW = img.getBoundingClientRect().width;
    const dispH = img.getBoundingClientRect().height;
    const scaleX = imageData.width / dispW;
    const scaleY = imageData.height / dispH;

    let x = Math.round((box.left - wrap.left) * scaleX);
    let y = Math.round((box.top  - wrap.top)  * scaleY);
    let w = Math.round(box.width * scaleX);
    let h = Math.round(box.height * scaleY);

    // clamp to source bounds
    x = Math.max(0, Math.min(x, imageData.width - 1));
    y = Math.max(0, Math.min(y, imageData.height - 1));
    w = Math.max(1, Math.min(w, imageData.width - x));
    h = Math.max(1, Math.min(h, imageData.height - y));

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    out.getContext("2d").drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);

    return new Promise(resolve => out.toBlob(resolve, "image/png"));
  };

  return wrapper;
}
