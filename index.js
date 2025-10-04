const fps=2;
const ImagesPerReccording=5;
let password="hi";
async function checkPassword(name, password) {
  const res = await fetch(serverLink + "/checkPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name:name, password:password })
  });

  return await res.json(); // <-- gives you true/false
}
async function addNewBook(LibID, BookID, BookTitle, coverBlob ) {
  const formData = new FormData();
  formData.append("LibID", LibID);
  formData.append("BookID", BookID);
  formData.append("BookTitle", BookTitle);
  formData.append("password", password);
  formData.append("BookCover", coverBlob, "cover.png"); // 👈 important: give filename

  const res = await fetch(serverLink + "/NewBook", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add book");
  return data;
}
async function getLibraryContents(libName) {
  const res = await fetch(serverLink + "/LibraryContents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: libName })
  });

  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    const err = await res.json();
    throw new Error(err.error || "Unknown server error");
  }

  // ✅ Let browser parse the multipart
  const blob = await res.blob();
  const formData = await new Response(blob, {
    headers: { "Content-Type": contentType }
  }).formData();

  const result = { metadata: null, covers: {} };

  for (const [field, value] of formData.entries()) {
    if (field === "metadata") {
      // server sends metadata as plain text
      result.metadata = JSON.parse(value);
    } else if (field.startsWith("cover-")) {
      const bookID = field.replace("cover-", "");
      result.covers[bookID] = value; // Blob (image/png)
    }
  }

  return result;
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

  // Convert response to formData
  const blob = await res.blob();
  const formData = await new Response(blob, {
    headers: { "Content-Type": contentType }
  }).formData();

  let book = null;
  const borrowedHistory = [];

  for (const [fieldName, value] of formData.entries()) {

    if (fieldName === "metadata") {
      try {
        book = JSON.parse(value);
      } catch (e) {
        console.error("Failed to parse metadata", e);
      }
    } else if (fieldName === "cover") {
      if (book) book.coverPicture = value; // Blob
    } else if (fieldName.startsWith("historyThumb-")) {
      const startTime = parseInt(fieldName.replace("historyThumb-", ""), 10);
      borrowedHistory.push({
        start: startTime,
        thumbnailPhoto: value,
        video: null
      });
    } else if (fieldName.startsWith("historyVideo-")) {
      const startTime = parseInt(fieldName.replace("historyVideo-", ""), 10);
      const historyObj = borrowedHistory.find(h => h.start === startTime);
      if (historyObj) historyObj.video = value;
    }
  }

  if (book) book.BorrowedHistory = borrowedHistory;
  return book;
}


async function deleteBook(libID, bookID) {
  const res = await fetch(serverLink + "/DeleteBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      LibID: libID,
      BookID: bookID,
      password: password
    })
  });

  const json = await res.json();
  console.log(json);
  return json;
}

async function borrowBook(libID, bookID, blobs) {
  const formData = new FormData();
  formData.append("LibID", libID);
  formData.append("BookID", bookID);
  formData.append("password", password); // make sure this exists

  // append each blob as "images"
blobs.forEach((blob, i) => {
 formData.append("images", new File([blob], `frame_${i}.jpg`, { type: "image/jpeg" }));

});


  const res = await fetch(serverLink+"/Borrow", {
    method: "POST",
    body: formData
  });

  const json = await res.json();
  console.log(json);
  return json;
}

async function returnBook(libID, bookID) {
  const res = await fetch(serverLink + "/Return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      LibID: libID,
      BookID: bookID,
      password: password
    })
  });

  const json = await res.json();
  console.log(json);
  return json;
}


function SetUpBorrow(lib,book){
    BorrowData={lib:lib,book:book}
ImagesList.splice(0,ImagesList.length-Math.ceil(ImagesPerReccording/2));
}
const ImagesList=[];
//when someone wants to borrow, it counts down how many frames left until the system borrows
async function runCamera(){
    
let BorrowData=null; 
setInterval(async () => {

    ImagesList.push( captureFrame());
    
    if((ImagesList.length>Math.ceil(ImagesPerReccording/2))&&window.BorrowData==null){ImagesList.splice(0,ImagesList.length-Math.ceil(ImagesPerReccording/2));}

    showImage(ImagesList[ImagesList.length-1],document.getElementById("imageDiv"))

    if(window.BorrowData!=null)if(ImagesList.length==ImagesPerReccording){
      
        borrowBook(window.BorrowData.lib,window.BorrowData.book,await imageDataListToBlobs(ImagesList))
    window.BorrowData=null;
      }
    
}, 1000/fps)
}
