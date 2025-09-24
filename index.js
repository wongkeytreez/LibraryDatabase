const fps=2;
const ImagesPerReccording=5;
let password="sigma";
async function checkPassword(name, password) {
  const res = await fetch(serverLink + "/checkPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name:name, password:password })
  });

  return await res.json(); // <-- gives you true/false
}

async function getLibraryContents(libName) {
  const res = await fetch(serverLink + "/LibraryContents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: libName })
  });

  const contentType = res.headers.get("Content-Type") || "";

  // If server responded with JSON → probably an error
  if (contentType.includes("application/json")) {
    const err = await res.json();
    throw new Error(err.error || "Unknown server error");
  }

  // Otherwise continue with multipart parsing
  const boundaryMatch = contentType.match(/boundary=(.*)$/);
  if (!boundaryMatch) throw new Error("Boundary not found");
  const boundaryStr = boundaryMatch[1];
  const boundary = `--${boundaryStr}`;

  // Get raw bytes
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const result = { metadata: null, covers: {} };

  // Helper: convert Uint8Array slice to string
  const bytesToString = (arr) => new TextDecoder("utf-8").decode(arr);

  // Convert boundary to bytes for comparison
  const boundaryBytes = new TextEncoder().encode(boundary);

  let ptr = 0;
  while (ptr < bytes.length) {
    // Find the next boundary
    const nextBoundary = findNextBoundary(bytes, ptr, boundaryBytes);
    if (nextBoundary === -1) break;

    // Slice part bytes
    const part = bytes.slice(ptr, nextBoundary);

    // Find header/body split (\r\n\r\n)
    let headerEnd = -1;
    for (let i = 0; i < part.length - 3; i++) {
      if (part[i] === 13 && part[i + 1] === 10 && part[i + 2] === 13 && part[i + 3] === 10) {
        headerEnd = i + 4;
        break;
      }
    }

    if (headerEnd === -1) {
      ptr = nextBoundary + boundaryBytes.length;
      continue;
    }

    const headerBytes = part.slice(0, headerEnd);
    const bodyBytes = part.slice(headerEnd);

    const headerStr = bytesToString(headerBytes);

    if (headerStr.includes('name="metadata"')) {
      const jsonStrMatch = bytesToString(bodyBytes).match(/{[\s\S]*}/);
      if (jsonStrMatch) result.metadata = JSON.parse(jsonStrMatch[0]);
    } else {
      const nameMatch = headerStr.match(/name="cover-(\d+)"/);
      if (nameMatch) {
        const bookID = nameMatch[1];
        result.covers[bookID] = new Blob([bodyBytes], { type: "image/png" });
      }
    }

    ptr = nextBoundary + boundaryBytes.length;
  }

  return result;

  // Helper function to find next boundary in bytes
  function findNextBoundary(bytes, start, boundaryBytes) {
    for (let i = start; i <= bytes.length - boundaryBytes.length; i++) {
      let match = true;
      for (let j = 0; j < boundaryBytes.length; j++) {
        if (bytes[i + j] !== boundaryBytes[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }
    return -1;
  }
}



async function getBookContents(BookID, LibID) {
  const res = await fetch(serverLink + "/BookContents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ BookID, LibID }),
  });

  const contentType = res.headers.get("Content-Type") || "";
  if (!contentType.includes("multipart/form-data")) {
    const errText = await res.text();
    throw new Error("Unexpected response type: " + contentType + "\n" + errText);
  }

  // Extract boundary
  const boundaryMatch = contentType.match(/boundary=(.*)$/);
  if (!boundaryMatch) throw new Error("Boundary not found");
  const boundary = `--${boundaryMatch[1]}`;

  // Fetch raw bytes
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Helper to find subarrays
  function indexOfSubarray(haystack, needle, fromIndex = 0) {
    outer: for (let i = fromIndex; i <= haystack.length - needle.length; i++) {
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) continue outer;
      }
      return i;
    }
    return -1;
  }

  let parts = [];
  let start = 0;
  const boundaryBytes = new TextEncoder().encode(boundary);

  // Split into multipart parts
  while (true) {
    const idx = indexOfSubarray(bytes, boundaryBytes, start);
    if (idx === -1) break;
    const nextIdx = indexOfSubarray(bytes, boundaryBytes, idx + boundaryBytes.length);
    const end = nextIdx === -1 ? bytes.length : nextIdx;
    const part = bytes.slice(idx + boundaryBytes.length, end);
    parts.push(part);
    start = end;
  }

  let book = null;
  const borrowedHistory = [];

  for (const partBytes of parts) {
    const partText = new TextDecoder().decode(partBytes);
    const headerEnd = partText.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;

    const rawHeaders = partText.slice(0, headerEnd);
    const headers = rawHeaders.split("\r\n");
    const disp = headers.find(h => h.toLowerCase().startsWith("content-disposition")) || "";
    const nameMatch = disp.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    const bodyOffset = headerEnd + 4;
    const bodyBytes = partBytes.slice(bodyOffset);

    if (fieldName === "metadata") {
      try {
        book = JSON.parse(new TextDecoder().decode(bodyBytes));
      } catch (e) {
        console.error("Failed to parse metadata", e);
      }
    } 
    else if (fieldName === "cover") {
      if (book) book.coverPicture = new Blob([bodyBytes], { type: "image/png" });
    } 
    else if (fieldName.startsWith("historyThumb-")) {
      const startTime = parseInt(fieldName.replace("historyThumb-", ""), 10);
      const thumbBlob = new Blob([bodyBytes], { type: "image/png" });
      let bStruct = new BorrowedStruct();
      bStruct.start = startTime;
      bStruct.thumbnailPhoto = thumbBlob;
      borrowedHistory.push(bStruct);
    } 
    else if (fieldName.startsWith("historyVideo-")) {
      const startTime = parseInt(fieldName.replace("historyVideo-", ""), 10);
      const vidBlob = new Blob([bodyBytes], { type: "video/mp4" });
      const bStruct = borrowedHistory.find(b => b.start === startTime);
      if (bStruct) bStruct.video = vidBlob;
    }
  }

  if (book) book.BorrowedHistory = borrowedHistory;
  return book;
}




function SetUpBorrow(lib,book){
    BorrowData={lib:lib,book:book}
}

const ImagesList=[]
let BorrowData=null; //when someone wants to borrow, it counts down how many frames left until the system borrows
//initCamera().then(()=>
setInterval(async () => {
    ImagesList.push( null);//captureFrame());
    
    //if(ImagesList.length>Math.ceil(ImagesPerReccording/2)&&BorrowData==null)ImagesList.splice(0,1);
    //showImage(ImagesList[ImagesList.length-1],"hello")
   
    if(BorrowData!=null)if(ImagesList.length==ImagesPerReccording){
      
        Borrow(BorrowData.lib,BorrowData.book,await imageDataListToBlobs(ImagesList));BorrowData=null;
    }
    
}, 1000/fps)
//)