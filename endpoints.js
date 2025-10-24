async function RequestCookie(LibName,libPassword){
    const res = await fetch(ServerAdress + "/RequestCookie", {
  method: "POST",
   credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ LibName, libPassword })
});
const data = await res.json();
if(!data.error)return data
else return;
}
async function updateCookie() {
      const res = await fetch(ServerAdress + "/UpdateCookie", {
  method: "POST",
   credentials: "include",
  headers: { "Content-Type": "application/json" },
});
const data = await res.json();
if(!data.error)return data
else return;
}
async function fetchNoCache(url) {
  // Just append a random query param — no headers → no preflight
  const response = await fetch(url + "?nocache=" + Date.now(), { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
  return await response.json();
}

async function getLibrary(libName) {
  return await fetchNoCache(`${GithubLink}${libName}/data.json`);
}

async function getBook(libName, bookID) {
  return await fetchNoCache(`${GithubLink}${libName}/${bookID}/data.json`);
}




async function AddBook(title, id, genres, desc, cover,authors) {
  const form = new FormData();
  if (typeof cover === "string") {
    form.append("data", JSON.stringify({ title, id, genres, desc,authors, cover }));
  } else {
    form.append("photo", cover); // File or Blob
    form.append("data", JSON.stringify({ title, id, genres, desc,authors }));
  }

  const res = await fetch(ServerAdress + "/AddBook", {
    method: "POST",
    credentials: "include",
    body: form // DO NOT set Content-Type manually
  });

  const data = await res.json();
  console.log(data);
  
  window.reload();
}

async function Borrow(photos,bookID) {
const form =  new FormData();

for (const photo of photos) {
  form.append("photos", photo); // name "files" must match multer field name
}
form.append("data", JSON.stringify({bookID}));
   
const res = await fetch(ServerAdress + "/Borrow", {
  method: "POST",
  credentials:"include",
  headers: { "Content-Type": "application/json" },
  body:form
});

const data = await res.json();
console.log(data)
  window.reload();
}
async function Return(bookID) {

   
const res = await fetch(ServerAdress + "/Return", {
  method: "POST",
  credentials:"include",
  headers: { "Content-Type": "application/json" },
  body:JSON.stringify({bookID})
});

const data = await res.json();
console.log(data)
  window.reload();
}
async function GetISBNBook(isbn) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch book data");

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error("Book not found");
    }
    const fullData=data.items[0].volumeInfo
    console.log(fullData)
    // Return the raw book object from Google Books
    return {title:fullData.title,id:isbn,genres:fullData.categories,desc:fullData.description,cover:fullData.imageLinks.thumbnail,authors:fullData.authors};
  } catch (err) {
    console.error("Error fetching book details:", err.message);
    return { error: err.message };
  }
}