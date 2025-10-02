// Basic page setup
document.documentElement.style.height = "100%";
const screen = document.getElementById("screen");
screen.style.margin = "0";
screen.style.height = "100%";   // ✅ add this
screen.style.minHeight = "100%";
screen.style.display = "flex";
screen.style.justifyContent = "center";
screen.style.alignItems = "center";
screen.style.background = "#f0f2f5";
screen.style.fontFamily = "Segoe UI, Roboto, Arial, sans-serif";


let ListOfBooks = [];
let SidebarStatus="Borrow";
// Start screen
function Start1() {
    document.getElementById("hello").style.opacity=0;
    document.getElementById("hello").style.pointerEvents = "none"
  document.getElementById("screen").innerHTML = "";

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.gap = "18px";
  container.style.width = "320px";
  container.style.padding = "36px";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
  container.style.background = "white";

  const title = document.createElement("h2");
  title.textContent = "Choose Mode";
  title.style.margin = "0";
  container.appendChild(title);

  const clientBtn = document.createElement("button");
  clientBtn.textContent = "Client";
  clientBtn.style.width = "100%";
  clientBtn.style.padding = "14px";
  clientBtn.style.fontSize = "18px";
  clientBtn.style.cursor = "pointer";
  clientBtn.addEventListener("click", () => { server = false; Start2(); });
  container.appendChild(clientBtn);

  const serverBtn = document.createElement("button");
  serverBtn.textContent = "Server";
  serverBtn.style.width = "100%";
  serverBtn.style.padding = "14px";
  serverBtn.style.fontSize = "18px";
  serverBtn.style.cursor = "pointer";
  serverBtn.addEventListener("click", () => { server = true; Start2(); });
  container.appendChild(serverBtn);

  document.getElementById("screen").appendChild(container);
}
let libID;
// Library form
function Start2() {
  document.getElementById("screen").innerHTML = "";

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "stretch";
  container.style.gap = "12px";
  container.style.width = "420px";
  container.style.padding = "24px";
  container.style.borderRadius = "10px";
  container.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
  container.style.background = "white";

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Library name";
  container.appendChild(nameLabel);

  const nameInput = document.createElement("input");
  nameInput.id = "libName";
  nameInput.type = "text";
  nameInput.placeholder = "Type library id/name";
  nameInput.style.padding = "10px";
  container.appendChild(nameInput);

  let passInput = null;
  if (server) {
    const passLabel = document.createElement("label");
    passLabel.textContent = "Library password";
    container.appendChild(passLabel);

    passInput = document.createElement("input");
    passInput.id = "libPassword";
    passInput.type = "text";
    passInput.placeholder = "password";
    passInput.style.padding = "10px";
    container.appendChild(passInput);
  }

  const enterBtn = document.createElement("button");
  enterBtn.textContent = "Enter";
  enterBtn.style.padding = "12px";
  enterBtn.style.fontSize = "16px";
  enterBtn.style.cursor = "pointer";
  enterBtn.addEventListener("click", () => Start3(nameInput.value, passInput ? passInput.value : null));
  container.appendChild(enterBtn);

  document.getElementById("screen").appendChild(container);
}

// Show library contents (uses getLibraryContents already in your client)
async function Start3(libName, Password) {
  libName=libName;
password=Password;
  if (!libName) return Start2();
if(server)if(!await checkPassword(libName,password)) return Start2();
console.log(libName,password,checkPassword(libName,password))
  document.getElementById("screen").innerHTML = ""; // clear while loading
  const loading = document.createElement("div");
  loading.textContent = "Loading...";
  loading.style.fontSize = "18px";
  loading.style.margin = "20px";
  document.getElementById("screen").appendChild(loading);
async function reloadLibrary(){
  
  try {
    ListOfBooks = await getLibraryContents(libName);
     // your existing function
    if (!ListOfBooks || !ListOfBooks.metadata) {
      throw new Error("No library data");
    }
    libID=ListOfBooks.metadata.id
  } catch (e) {
    console.error(e);
    return Start2();
  }
}
await reloadLibrary();

if (server) {

    function setToggle(state) {
      SidebarStatus=state;
const parent = document.getElementById("toggleContainer");

// change *every child element* inside it
Array.from(parent.querySelectorAll("*")).forEach(el => {

el.style.opacity=0.5
});
document.getElementById(state).style.opacity=1;
const questions = document.getElementById("questions");
questions.innerHTML = ""; 
if(state=="add"){
// clear it first

// Book ID input
const bookIdInput = document.createElement("input");
bookIdInput.type = "text";
bookIdInput.placeholder = "Book ID";
bookIdInput.id = "bookId";
questions.appendChild(bookIdInput);

// Book Name input
const bookNameInput = document.createElement("input");
bookNameInput.type = "text";
bookNameInput.placeholder = "Book Name";
bookNameInput.id = "bookName";
questions.appendChild(bookNameInput);

// Take picture button
const takePicBtn = document.createElement("button");
takePicBtn.textContent = "Take a picture";
let wrapper;
takePicBtn.onclick = async() => {
  // For now just show placeholder
  preview.innerHTML="";
   wrapper= createManualCropper(preview,ImagesList[ImagesList.length-1]);
  
//showImage(await cropForeground(ImagesList[ImagesList.length-1]),preview);
};
questions.appendChild(takePicBtn);

// Image preview (empty for now)
const preview = document.createElement("div");
preview.id = "preview";
preview.style.display = "block";
preview.style.width = "100%";
preview.style.height = "auto";
preview.style.marginTop = "10px";
questions.appendChild(preview);

// Submit button
const submitBtn = document.createElement("button");
submitBtn.textContent = "Submit";
submitBtn.onclick = async () => {
  const bookId = bookIdInput.value.trim();
  const bookName = bookNameInput.value.trim();
  const bookCover = await wrapper.getCroppedImageBlob();
  console.log(bookCover)
  console.log({ bookId, bookName,bookCover });
  addNewBook(libID,bookId,bookName,bookCover);
showLibrary();

};
questions.appendChild(submitBtn);
}

}
initCamera().then(()=>{
runCamera();
})
// expose function globally
window.setToggle = setToggle;
     document.getElementById("hello").style.pointerEvents = "auto"
  let sidebar = document.getElementById("hello");


  screen.width = "70%";
  sidebar.style.width = "30%";
  sidebar.style.opacity = 1;
  sidebar.style.position = "static";
  sidebar.style.display="flex";
  sidebar.style.flexDirection="column";
  // --- Toggle container ---
  const toggleContainer = document.createElement("div");
  toggleContainer.style.margin = "12px";

  toggleContainer.innerHTML = `
    <div style="display:flex; gap:10px;" id="toggleContainer">
      <button type="button" id="borrow" onclick="setToggle('borrow')">BORROW</button>
      <button type="button" id="return" onclick="setToggle('return')">RETURN</button>
      <button type="button" id="add" onclick="setToggle('add')">ADD BOOK</button>
      <button type="button" id="delete" onclick="setToggle('delete')">REMOVE BOOK</button>
    </div>
  `;
  sidebar.innerHTML="<div style=width:100%; id=imageDiv></div>"

  sidebar.appendChild(toggleContainer);
  const questionsDiv=document.createElement('div');
  questionsDiv.id="questions";
  questionsDiv.style.width="70%"
  questionsDiv.style.display="flex";
  questionsDiv.style.flexDirection="column"
  sidebar.appendChild(questionsDiv);
  // default state
  setToggle("borrow");
}




async function showLibrary() {
  await reloadLibrary();
  // create gallery container
  document.getElementById("screen").innerHTML = "";
  const gallery = document.createElement("div");
  gallery.style.display = "flex";
  gallery.style.flexWrap = "wrap";
  gallery.style.justifyContent = "center";
  gallery.style.gap = "24px";
  gallery.style.padding = "24px";
  gallery.style.width = "100%";
  gallery.style.boxSizing = "border-box";
  document.getElementById("screen").appendChild(gallery);

  const books = ListOfBooks.metadata.books;
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const bookId = String(book.id);
const card = document.createElement("div");
card.style.width = "280px";
card.style.height = "420px";
card.style.display = "flex";
card.style.flexDirection = "column";
card.style.alignItems = "center";
card.style.gap = "10px";
card.style.padding = "12px";
card.style.borderRadius = "14px";
card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
card.style.background = "white";
card.style.overflow = "hidden";

// get the cover blob safely
let coverBlob = ListOfBooks.covers[bookId] ?? Object.values(ListOfBooks.covers)[i] ?? null;
const img = document.createElement("img");
if (coverBlob) {
  img.src = URL.createObjectURL(coverBlob);
} else {
  // fallback (1x1 white)
  img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
}

// Ensure all images have the same height
img.style.width = "100%";
img.style.height = "60%";        // relative to card height
img.style.objectFit = "contain"; // keeps full image
// ensures whole image fits
img.style.borderRadius = "8px";

card.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = book.name ?? "Untitled";
    title.style.margin = "6px 0 0 0";
    title.style.fontSize = "18px";
    title.style.textAlign = "center";
    card.appendChild(title);

   const meta = document.createElement("div");
meta.style.fontSize = "13px";
meta.style.color = "#555";
meta.style.textAlign = "center";
meta.style.marginTop = "6px";
meta.style.display = "flex";
meta.style.flexDirection = "column";
meta.style.gap = "6px"; // spacing between rows

// genre row
const genreText = (book.genre && book.genre.length) ? book.genre.join(", ") : "No genre";
const genreRow = document.createElement("div");
genreRow.textContent = genreText;
meta.appendChild(genreRow);

// Avg borrow row
const avgRow = document.createElement("div");
avgRow.textContent = `Average borrowing time: ${book.AvgBorrowTime ?? "-"}`;
meta.appendChild(avgRow);

// Availability row (server property: "Availibility")
const availRow = document.createElement("div");
const isAvailable = book.Availibility === true; // note capitalisation from server
availRow.textContent = isAvailable ? "Available" : "Not available";
availRow.style.fontWeight = "600";
availRow.style.color = isAvailable ? "#198754" : "#d9534f"; // green/red
meta.appendChild(availRow);
card.appendChild(meta);

    gallery.appendChild(card);
      card.addEventListener("click", (c) => {
      showBook(book.id)
  });
  }
  

  }

 async function showBook(bookID) {
  // helper to revoke created object URLs
  const urlsToRevoke = [];
  function createURL(blob) {
    if (!blob) return null;
    const u = URL.createObjectURL(blob);
    urlsToRevoke.push(u);
    return u;
  }
  function cleanup() { urlsToRevoke.forEach(u => URL.revokeObjectURL(u)); }

  const screen = document.getElementById("screen");
  screen.innerHTML = ""; // clear
  cleanup(); // just in case

  const book = await getBookContents(bookID,libID); // assumes this returns your Book object
  if (!book) return;

  // top-level container
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.width = "100%";
  container.style.boxSizing = "border-box";
  container.style.padding = "24px";
  screen.appendChild(container);

  // Row with cover card and description card
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "24px";
  row.style.justifyContent = "center";
  row.style.flexWrap = "wrap"; // stacks on small screens
  row.style.width = "100%";
  container.appendChild(row);

  const CARD_W = "320px";
  const CARD_H = "460px";
  const baseCardStyle = (el) => {
    el.style.width = CARD_W;
    el.style.height = CARD_H;
    el.style.boxSizing = "border-box";
    el.style.padding = "12px";
    el.style.borderRadius = "14px";
    el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
    el.style.background = "white";
    el.style.overflow = "hidden";
  };

  // --- Cover card ---
  const coverCard = document.createElement("div");
  baseCardStyle(coverCard);
  coverCard.style.display = "flex";
  coverCard.style.flexDirection = "column";
  coverCard.style.alignItems = "center";
  coverCard.style.gap = "10px";
  row.appendChild(coverCard);

  const img = document.createElement("img");
  const coverBlob = book.coverPicture ?? null; // from your Book shape
  const imgUrl = createURL(coverBlob) ?? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
  img.src = imgUrl;
  img.style.width = "100%";
  img.style.height = "60%";
  img.style.objectFit = "contain";
  img.style.borderRadius = "8px";
  coverCard.appendChild(img);

  const title = document.createElement("h3");
  title.textContent = book.name ?? "Untitled";
  title.style.margin = "6px 0 0 0";
  title.style.fontSize = "18px";
  title.style.textAlign = "center";
  coverCard.appendChild(title);

  // small meta (author/ID)
  const idRow = document.createElement("div");
  idRow.textContent = `ID: ${book.ID ?? "-"}`;
  idRow.style.fontSize = "12px";
  idRow.style.color = "#666";
  coverCard.appendChild(idRow);

  // --- Description card (same size) ---
  const descCard = document.createElement("div");
  baseCardStyle(descCard);
  descCard.style.display = "flex";
  descCard.style.flexDirection = "column";
  descCard.style.gap = "8px";
  row.appendChild(descCard);

  const descTitle = document.createElement("h3");
  descTitle.textContent = "Description";
  descTitle.style.margin = 0;
  descTitle.style.fontSize = "16px";
  descCard.appendChild(descTitle);

  const descText = document.createElement("div");
  descText.textContent = book.desc ?? "No description.";
  descText.style.fontSize = "14px";
  descText.style.color = "#333";
  descText.style.flex = "1";
  descText.style.overflow = "auto";
  descCard.appendChild(descText);

  // genres (server used either `genre` or `genres`)
  const genres = (book.genres && book.genres.length) ? book.genres
                 : (book.genre && book.genre.length) ? book.genre
                 : [];
  const gRow = document.createElement("div");
  gRow.textContent = genres.length ? `Genres: ${genres.join(", ")}` : "Genres: -";
  gRow.style.fontSize = "13px";
  gRow.style.color = "#555";
  descCard.appendChild(gRow);

  const avgRow = document.createElement("div");
  avgRow.textContent = `Average borrow time: ${book.AvgBorrowTime ?? "-"}`;
  avgRow.style.fontSize = "13px";
  avgRow.style.color = "#555";
  descCard.appendChild(avgRow);

  const avail = document.createElement("div");
  const isAvailable = book.Availibility === true || book.Availability === true || book.available === true;
  avail.textContent = isAvailable ? "Available" : "Not available";
  avail.style.fontWeight = "600";
  avail.style.color = isAvailable ? "#198754" : "#d9534f";
  descCard.appendChild(avail);

  // optional actions row (borrow / back / edit)
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.marginTop = "8px";
  descCard.appendChild(actions);

  const backBtn = document.createElement("button");
  backBtn.textContent = "Back";
  backBtn.onclick = async() => {
    cleanup();
    showLibrary();

  };
  actions.appendChild(backBtn);

  // --- Borrowed histories grid below ---
  const historiesContainer = document.createElement("div");
  historiesContainer.style.marginTop = "20px";
  historiesContainer.style.width = "100%";
  historiesContainer.style.display = "grid";
  historiesContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  historiesContainer.style.gap = "16px";
  container.appendChild(historiesContainer);

  const histories = Array.isArray(book.BorrowedHistory) ? book.BorrowedHistory : [];

  if (histories.length === 0) {
    const none = document.createElement("div");
    none.textContent = "No borrow history.";
    none.style.color = "#666";
    historiesContainer.appendChild(none);
  } else {
    histories.forEach(h => {
      const hc = document.createElement("div");
      hc.style.padding = "10px";
      hc.style.borderRadius = "10px";
      hc.style.background = "#fff";
      hc.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
      hc.style.display = "flex";
      hc.style.flexDirection = "column";
      hc.style.gap = "8px";

      // thumbnail (if any)
      const thumbUrl = createURL(h.thumbnailPhoto ?? h.thumbnail ?? null);
      const thumbImg = document.createElement("img");
      thumbImg.src = thumbUrl ?? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
      thumbImg.style.width = "100%";
      thumbImg.style.height = "120px";
      thumbImg.style.objectFit = "cover";
      thumbImg.style.borderRadius = "6px";
      hc.appendChild(thumbImg);

      // start / end
      const times = document.createElement("div");
      times.style.fontSize = "12px";
      times.style.color = "#444";
      const start = h.start ? new Date(Number(h.start)).toLocaleString() : "-";
      const end = h.end ? new Date(Number(h.end)).toLocaleString() : "-";
      times.textContent = `Start: ${start} — End: ${end}`;
      hc.appendChild(times);

      // video preview + play button
      if (h.video) {
        const videoUrl = createURL(h.video);
        const vid = document.createElement("video");
        vid.src = videoUrl;
        vid.controls = true;
        vid.style.width = "100%";
        vid.style.height = "140px";
        vid.style.borderRadius = "6px";
        hc.appendChild(vid);
      }

      historiesContainer.appendChild(hc);
    });
  }

  // cleanup when user navigates away - you can adapt to your router
  // here we attach a simple handler: clear screen will revoke urls
  // If you have your own navigation, call cleanup() when leaving this view.
  // (Optionally) attach ephemeral global to allow outside calls:
  window._lastShowBookCleanup = cleanup;
}


      showLibrary();
}
Start1();
