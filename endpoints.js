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
// simple in-memory ETag cache
const etagCache = new Map();

async function fetchWithSmartCache(url) {
  const headers = {};
  const cachedEtag = etagCache.get(url);
  if (cachedEtag) headers["If-None-Match"] = cachedEtag;

  const response = await fetch(url, { headers, cache: "default" });

  if (response.status === 304) {
    // 304 means "Not Modified" → use cached version
    return null;
  }

  if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

  const etag = response.headers.get("ETag");
  if (etag) etagCache.set(url, etag);

  const data = await response.json();
  return data;
}

async function getLibrary(libName) {
  const url = `${GithubLink}${libName}/data.json`;
  const data = await fetchWithSmartCache(url);
  return data;
}

async function getBook(libName, bookID) {
  const url = `${GithubLink}${libName}/${bookID}/data.json`;
  const data = await fetchWithSmartCache(url);
  return data;
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