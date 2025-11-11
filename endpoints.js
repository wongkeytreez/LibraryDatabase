async function RequestCookie(LibName, libPassword) {
  try {
    const res = await fetch(ServerAdress + "/RequestCookie", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ LibName, libPassword }),
    });
    const data = await res.json();
    if (!data.error) return data;
    else return { error: data.error };
  } catch (e) {
    console.log(e);
    return { error: e };
  }
}
async function updateCookie() {
  const res = await fetch(ServerAdress + "/UpdateCookie", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!data.error) return data;
  else return;
}
async function fetchNoCache(url) {
  // Just append a random query param — no headers → no preflight
  const response = await fetch(url + "?nocache=" + Date.now(), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
  return await response.json();
}

async function getLibrary(libName) {
  try {
    return await fetchNoCache(`${GithubLink}${libName}/data.json`);
  } catch (e) {
    console.log(e);
    return { error: e };
  }
}

async function getBook(libName, bookID) {
  try {
    return await fetchNoCache(`${GithubLink}${libName}/${bookID}/data.json`);
  } catch (e) {
    console.log(e);
  }
}
async function AddBook(title, id, genres, desc, cover, authors, password) {
  const form = new FormData();
  if (typeof cover === "string") {
    form.append(
      "data",
      JSON.stringify({ title, id, genres, desc, authors, cover })
    );
  } else {
    form.append("photo", cover); // File or Blob
    form.append("data", JSON.stringify({ title, id, genres, desc, authors }));
  }

  const res = await fetch(ServerAdress + "/AddBook", {
    method: "POST",
    credentials: "include",
    body: form, // DO NOT set Content-Type manually
  });

  const data = await res.json();
  return data;

  window.ReloadMain(libname, isserver);
}
async function RemoveBook(id, password) {
  const form = new FormData();
  form.append("data", JSON.stringify({ id, password }));

  const res = await fetch(ServerAdress + "/RemoveBook", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  console.log(data);
  window.location.reload();
}

async function EditBook(id, edits, password) {
  const form = new FormData();

  // include cover if it's a file
  if (edits.cover instanceof File || edits.cover instanceof Blob) {
    form.append("photo", edits.cover);
  }

  form.append("data", JSON.stringify({ id, edits, password }));

  const res = await fetch(ServerAdress + "/EditBook", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  console.log(data);
  if (data.success) window.ReloadMain();
}
async function EditSettings(newSettings, password) {
  const body = { ...newSettings };
  if (password) body.password = password;

  const res = await fetch(ServerAdress + "/EditSettings", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log(data);
  window.ReloadMain();
}
async function Borrow(photos, bookID, password) {
  const form = new FormData();

  for (const photo of photos) {
    form.append("photos", photo); // name "files" must match multer field name
  }
  form.append("data", JSON.stringify({ bookID, password }));

  const res = await fetch(ServerAdress + "/Borrow", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  console.log(data);
  window.ReloadMain();
}
async function Return(bookID, password) {
  const res = await fetch(ServerAdress + "/Return", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookID, password }),
  });

  const data = await res.json();
  console.log(data);
  window.ReloadMain();
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
    const fullData = data.items[0].volumeInfo;
    console.log(fullData);
    // Return the raw book object from Google Books
    return {
      title: fullData.title,
      id: isbn,
      genres: fullData.categories,
      desc: fullData.description,
      cover: fullData.imageLinks.thumbnail,
      authors: fullData.authors,
    };
  } catch (err) {
    console.error("Error fetching book details:", err.message);
    return { error: err.message };
  }
}
