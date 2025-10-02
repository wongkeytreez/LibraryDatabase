
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
  // Turn ImageData into <img>
  const c = document.createElement("canvas");
  c.width = imageData.width;
  c.height = imageData.height;
  c.getContext("2d").putImageData(imageData, 0, 0);
  const imgURL = c.toDataURL();

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.userSelect = "none";
  container.appendChild(wrapper);

  // Image
  const img = document.createElement("img");
  img.src = imgURL;
  img.style.display = "block";
  img.style.maxWidth = "100%";
  img.style.maxHeight = "100%";
  img.style.width = "100%";
  img.style.height = "auto";
  wrapper.appendChild(img);

  // Crop box
  const cropBox = document.createElement("div");
  cropBox.style.position = "absolute";
  cropBox.style.border = "2px dashed lime";
  cropBox.style.left = "50px";
  cropBox.style.top = "50px";
  cropBox.style.width = "100px";
  cropBox.style.height = "100px";
  wrapper.appendChild(cropBox);

  // Handles
  const positions = ["nw", "ne", "sw", "se"];
  const handles = {};
  positions.forEach((pos) => {
    const h = document.createElement("div");
    h.style.width = h.style.height = "12px";
    h.style.background = "red";
    h.style.position = "absolute";
    h.style.cursor = pos + "-resize";
    cropBox.appendChild(h);
    handles[pos] = h;
  });

  function updateHandles() {
    handles.nw.style.left = "-6px";  handles.nw.style.top = "-6px";
    handles.ne.style.right = "-6px"; handles.ne.style.top = "-6px";
    handles.sw.style.left = "-6px";  handles.sw.style.bottom = "-6px";
    handles.se.style.right = "-6px"; handles.se.style.bottom = "-6px";
  }
  updateHandles();

  // Dragging / resizing
  let mode = null, startX, startY, startBox;

  function startDrag(e, touch = false) {
    let point = touch ? e.touches[0] : e;
    if (Object.values(handles).includes(e.target)) {
      mode = e.target;
    } else {
      mode = "move";
    }
    startX = point.clientX;
    startY = point.clientY;
    startBox = cropBox.getBoundingClientRect();
    e.preventDefault();
  }

  function onDrag(e, touch = false) {
    if (!mode) return;
    let point = touch ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    const wrap = wrapper.getBoundingClientRect();

    if (mode === "move") {
      cropBox.style.left =
        startBox.left + dx - wrap.left + "px";
      cropBox.style.top =
        startBox.top + dy - wrap.top + "px";
    } else {
      if (mode === handles.nw) {
        cropBox.style.left = startBox.left + dx - wrap.left + "px";
        cropBox.style.top  = startBox.top  + dy - wrap.top  + "px";
        cropBox.style.width  = startBox.width  - dx + "px";
        cropBox.style.height = startBox.height - dy + "px";
      } else if (mode === handles.ne) {
        cropBox.style.top  = startBox.top  + dy - wrap.top  + "px";
        cropBox.style.width  = startBox.width  + dx + "px";
        cropBox.style.height = startBox.height - dy + "px";
      } else if (mode === handles.sw) {
        cropBox.style.left = startBox.left + dx - wrap.left + "px";
        cropBox.style.width  = startBox.width  - dx + "px";
        cropBox.style.height = startBox.height + dy + "px";
      } else if (mode === handles.se) {
        cropBox.style.width  = startBox.width  + dx + "px";
        cropBox.style.height = startBox.height + dy + "px";
      }
    }
    updateHandles();
    e.preventDefault();
  }

  function endDrag() {
    mode = null;
  }

  // Mouse events
  cropBox.addEventListener("mousedown", (e) => startDrag(e));
  window.addEventListener("mousemove", (e) => onDrag(e));
  window.addEventListener("mouseup", endDrag);

  // Touch events
  cropBox.addEventListener("touchstart", (e) => startDrag(e, true), { passive: false });
  window.addEventListener("touchmove", (e) => onDrag(e, true), { passive: false });
  window.addEventListener("touchend", endDrag);

  // Export cropped ImageData
  wrapper.getCroppedImageBlob = () => {
    const box = cropBox.getBoundingClientRect();
    const wrap = wrapper.getBoundingClientRect();
    const scaleX = imageData.width / img.getBoundingClientRect().width;
    const scaleY = imageData.height / img.getBoundingClientRect().height;

    const x = (box.left - wrap.left) * scaleX;
    const y = (box.top - wrap.top) * scaleY;
    const w = box.width * scaleX;
    const h = box.height * scaleY;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = w;
    outCanvas.height = h;
    outCanvas
      .getContext("2d")
      .drawImage(c, x, y, w, h, 0, 0, w, h);

    return new Promise((resolve) => {
      outCanvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  };

  return wrapper;
}
