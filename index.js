const express = require("express");
const cors = require("cors");
const { uploadFile, getFile } = require("./github.js");
const { imagesToVideo, shrinkToTarget } = require("./system.js");
const { findHighestFaceChance } = require("./ai.js");
const app = express();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const fs = require("fs");
const fps = 2;
const ImagesPerVideo = 10;
const ImageSizeInKB = 100;
const tokenMaxAge = 60000 * 7;
const BaseISBNUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:`;
app.use(express.json()); // lets us read JSON bodies
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // exact frontend origin
    credentials: true,
  }),
);

// Example route
app.post("/RequestCookie", (req, res) => {
  const { LibName, libPassword } = req.body;
  const library = libraries.find((lib) => lib.name === LibName);

  if (!library) {
    return res.status(404).json({ error: "Library not found" });
  }

  if (library.password !== libPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  if (library.token && library.token.ip !== req.ip) {
    return res.status(403).json({ error: "Library already in use" });
  }

  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * 100000).toString();
  } while (
    libraries.some((lib) =>
      lib.token ? lib.token.name === randomNumber : false,
    )
  );

  library.token = {
    name: randomNumber,
    lastUpdated: Date.now(),
    ip: req.ip,
  };
  try {
    res.cookie("token", randomNumber, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: tokenMaxAge,
    });
  } catch (e) {
    console.log(e);
  }
  console.log("library log in: " + library.name + ", Token: ", libraries);
  return res.status(200).json({ fps, ImagesPerVideo });
});
app.post("/UpdateCookie", (req, res) => {
  const library = getLibraryFromCookie(req);

  if (!library) {
    return res.status(404).json({ error: "Library not found" });
  }

  if (library.token.ip !== req.ip) {
    return res.status(403).json({ error: "Library already in use" });
  }

  res.cookie("token", library.token.name, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: tokenMaxAge,
  });

  return res.status(200).json({ success: true });
});
app.post("/AddBook", upload.single("photo"), async (req, res) => {
  let bookid; //only use this for the catch fallback
  const library = getLibraryFromCookie(req);
  if (!library) return res.status(401).json({ error: "Not authenticated" });
  try {
    // parse client-provided data (accepts JSON-string or object)
    const data =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;
    if (
      library.Settings.AddBookRequiresPassword == true &&
      data.password !== library.password
    )
      return res.status(401).json({ error: "Not authenticated" });
    if (!data || !data.id)
      return res.status(400).json({ error: "Missing book id" });
    data.id = TurnIntoNumber(String(data.id));
    bookid = data.id;
    // read library index file
    let libData = await getFile(`${library.name}/data.json`);

    // check for existing book id (case-insensitive)
    if (libData.books.find((b) => b.id === data.id)) {
      return res
        .status(409)
        .json({ error: "Book with same id already exists" });
    }
    library.processing.push(data.id);
    // prepare image file buffer (either uploaded or fetched from provided cover URL)
    let file;
    if (req.file) {
      file = req.file.buffer;
    } else if (data.cover) {
      const response = await fetch(data.cover);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      file = Buffer.from(arrayBuffer);
    } else return res.status(400).json({ error: "Missing book cover" });

    // Update library index
    libData.books.push({
      id: data.id,
      title: data.title,
      availible: true,
      avgBorrowLength: 0,
      genres: data.genres,
      authors: data.authors,
    });

    await uploadFile(
      `${library.name}/${data.id}/cover.jpg`,
      file.toString("base64"),
    );
    // Save JSON metadata
    await uploadFile(
      `${library.name}/${data.id}/data.json`,
      btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify({
              id: data.id,
              title: data.title,
              history: [],
              desc: data.desc,
            }),
          ),
        ),
      ),
    );
    await uploadFile(
      `${library.name}/data.json`,
      btoa(unescape(encodeURIComponent(JSON.stringify(libData)))),
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    library.processing = library.processing.filter((p) => p !== bookid);
  }
});
app.post("/RemoveBook", async (req, res) => {
  let bookid;
  const library = getLibraryFromCookie(req);
  if (!library) return res.status(401).json({ error: "Not authenticated" });

  try {
    const data =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;
    if (
      library.Settings.RemoveBookRequiresPassword == true &&
      data.password !== library.password
    )
      return res.status(401).json({ error: "Not authenticated" });
    if (!data || !data.id)
      return res.status(400).json({ error: "Missing book id" });

    bookid = TurnIntoNumber(String(data.id));

    let libData = await getFile(`${library.name}/data.json`);
    const index = libData.books.findIndex((b) => b.id === bookid);
    if (index === -1) return res.status(404).json({ error: "Book not found" });

    if (library.processing.includes(bookid))
      return res.status(400).json({ error: "Book is being processed" });
    library.processing.push(bookid);

    // Remove book from list
    libData.books.splice(index, 1);

    // Upload updated list
    await uploadFile(
      `${library.name}/data.json`,
      btoa(unescape(encodeURIComponent(JSON.stringify(libData)))),
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    library.processing = library.processing.filter((p) => p !== bookid);
  }
});
app.post("/EditBook", upload.single("photo"), async (req, res) => {
  let bookid;
  const library = getLibraryFromCookie(req);
  if (!library) return res.status(401).json({ error: "Not authenticated" });

  try {
    const data =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;

    if (!data || !data.id)
      return res.status(400).json({ error: "Missing book id" });
    if (
      library.Settings.EditBookRequiresPassword === true &&
      data.password !== library.password
    )
      return res.status(401).json({ error: "Not authenticated" });

    bookid = TurnIntoNumber(String(data.id));

    let libData = await getFile(`${library.name}/data.json`);
    let book = libData.books.find((b) => b.id === bookid);
    if (!book) return res.status(404).json({ error: "Book not found" });

    if (library.processing.includes(bookid))
      return res.status(400).json({ error: "Book is being processed" });
    library.processing.push(bookid);

    // apply edits dynamically
    const edits = data.edits || {};
    for (const key in edits) {
      if (key in book) {
        book[key] = edits[key];
      }
    }

    // handle cover (file or URL)
    let file;
    if (req.file) {
      file = req.file.buffer;
    } else if (edits.cover) {
      const response = await fetch(edits.cover);
      if (!response.ok)
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      file = Buffer.from(arrayBuffer);
    }

    if (file) {
      await uploadFile(
        `${library.name}/${bookid}/cover.jpg`,
        file.toString("base64"),
      );
    }

    // update library list
    await uploadFile(
      `${library.name}/data.json`,
      btoa(unescape(encodeURIComponent(JSON.stringify(libData)))),
    );

    // edit book data.json (for desc etc.)
    let bookData = await getFile(`${library.name}/${bookid}/data.json`);
    for (const key in edits) {
      if (key in bookData) {
        bookData[key] = edits[key];
      }
    }
    await uploadFile(
      `${library.name}/${bookid}/data.json`,
      btoa(unescape(encodeURIComponent(JSON.stringify(bookData)))),
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    library.processing = library.processing.filter((p) => p !== bookid);
  }
});
app.post("/Borrow", upload.array("photos"), async (req, res) => {
  let bookid; //only use this for the catch fallback
  const library = getLibraryFromCookie(req);
  if (!library) return res.status(401).json({ error: "Not authenticated" });
  try {
    const now = Date.now();
    const data = JSON.parse(req.body.data);
    if (
      library.Settings.BorrowBookRequiresPassword == true &&
      data.password !== library.password
    )
      return res.status(401).json({ error: "Not authenticated" });
    const bookData = await getFile(
      library.name + "/" + TurnIntoNumber(String(data.bookID)) + "/data.json",
    );
    const libData = await getFile(library.name + "/data.json");

    if (!bookData) return res.status(400).json({ error: "book doesnt exist" });

    if (library.processing.includes(bookData.id))
      return res
        .status(400)
        .json(
          "book is being currently processed by another call, try again later",
        );
    library.processing.push(bookData.id);
    bookid = bookData.id;
    if (libData.books.find((b) => b.id == bookData.id).availible == false)
      return res.status(400).json({ error: "book unavailible" });

    let files = await Promise.all(
      req.files.map((img) => shrinkToTarget(img.buffer, ImageSizeInKB)),
    );

    const best = (await findHighestFaceChance(files)) || 0;
    const video = await imagesToVideo(files, fps);

    bookData.history.push({ start: now, end: null, thumbnailFrame: best });
    libData.books.find((book) => book.id == bookData.id).availible = false;

    await uploadFile(
      library.name + "/" + bookData.id + "/videos/" + now + ".mp4",
      video.toString("base64"),
    );
    await uploadFile(
      library.name + "/" + bookData.id + "/data.json",
      btoa(unescape(encodeURIComponent(JSON.stringify(bookData)))),
    );
    await uploadFile(
      library.name + "/data.json",
      btoa(unescape(encodeURIComponent(JSON.stringify(libData)))),
    );
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
  } finally {
    library.processing = library.processing.filter((p) => p !== bookid);
  }
});
app.post("/Return", async (req, res) => {
  let bookid; //only use this for the catch fallback
  const library = getLibraryFromCookie(req);
  if (!library) return res.status(401).json({ error: "Not authenticated" });
  try {
    const libData = await getFile(library.name + "/data.json");
    const now = Date.now();
    const data = req.body;
    if (
      library.Settings.ReturnBookRequiresPassword == true &&
      data.password !== library.password
    )
      return res.status(401).json({ error: "Not authenticated" });
    const bookData = await getFile(
      library.name + "/" + TurnIntoNumber(String(data.bookID)) + "/data.json",
    );

    if (!bookData) return res.status(400).json({ error: "book doesnt exist" });
    if (libData.books.find((b) => b.id == bookData.id).availible == true)
      return res.status(400).json({ error: "book already returned" });
    if (library.processing.includes(bookData.id))
      return res.status(400).json({
        error:
          "book is currently being processed by another call, try again later",
      });
    library.processing.push(bookData.id);

    bookData.history[bookData.history.length - 1].end = now;
    const book = libData.books.find((book) => book.id == bookData.id);
    book.availible = true;
    book.avgBorrowLength =
      (book.avgBorrowLength * (bookData.history.length - 1) +
        (now - bookData.history[bookData.history.length - 1].start)) /
      bookData.history.length;

    await uploadFile(
      library.name + "/" + bookData.id + "/data.json",
      btoa(unescape(encodeURIComponent(JSON.stringify(bookData)))),
    );
    await uploadFile(
      library.name + "/data.json",
      btoa(unescape(encodeURIComponent(JSON.stringify(libData)))),
    );
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
  } finally {
    library.processing = library.processing.filter((p) => p !== bookid);
  }
});
app.post("/EditSettings", async (req, res) => {
  const library = getLibraryFromCookie(req);
  if (!library) return res.status(401).json({ error: "Not authenticated" });

  try {
    const data = req.body;
    if (data.password !== library.password)
      return res.status(401).json({ error: "Not authenticated" });
    for (const key in data) {
      if (key in library.Settings) {
        library.Settings[key] = data[key];
      }
    }

    fs.writeFileSync(
      "./libs.json",
      JSON.stringify(
        libraries.map((lib) => {
          const copy = { ...lib };
          delete copy.token;
          delete copy.processing;
          return copy;
        }),
      ),
    );

    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
  }
});

function checkToken(token) {
  const library = libraries.find((lib) =>
    lib.token ? lib.token.name == token : false,
  );

  if (library == null) return;
  if (Date.now() - library.token.lastUpdated > tokenMaxAge) {
    library.token = null;
    return null;
  }

  library.token.lastUpdated = Date.now();
  return library;
}
function getLibraryFromCookie(req) {
  const cookies = {};
  const header = req.headers.cookie;
  if (header) {
    header.split(";").forEach((pair) => {
      const [name, ...rest] = pair.split("=");
      cookies[name.trim()] = decodeURIComponent(rest.join("="));
    });
  }

  const library = checkToken(cookies["token"]);
  if (!library) return null;
  if (!library.token || library.token.ip !== req.ip) return null;
  return library;
}
function TurnIntoNumber(string) {
  return string.replace(/\D/g, "");
}
async function UpdateLibraries() {
  for (const library of libraries) {
    //get data of isbn books
    let libData = await getFile(`${library.name}/data.json`);
    let isbnBooks = libData.books.filter(
      (book) => book.id.slice(0, 3) === "978",
    );
    isbnBooks = await Promise.all(
      isbnBooks.map(async (book) => {
        const res = await fetch(BaseISBNUrl + book.id);
        const data = await res.json();

        if (!data.items || data.items.length === 0) return null;

        const info = data.items[0].volumeInfo;

        return {
          id: book.id,
          rating: info.averageRating || 0,
          popularity: info.ratingsCount || 0,
        };
      }),
    );

    isbnBooks = isbnBooks.filter(Boolean);

    libData.mostPopular = [];
    for (const book of libData.books) {
      let bookData = await getFile(`${library.name}/${book.id}/data.json`);
      libData.mostPopular.push({
        id: book.id,
        popularity: bookData.history.length,
      });
    }
    libData.mostPopular.sort((a, b) => b.popularity - a.popularity);

    await uploadFile(
      `${library.name}/data.json`,
      btoa(
        JSON.stringify({
          books: libData.books,
          mostPopularISBN: [...isbnBooks] // copy before sorting
            .sort((a, b) => b.popularity - a.popularity)
            .map((book) => book.id)
            .slice(0, 10),
          highestRatedBooksISBN: [...isbnBooks]
            .sort((a, b) => b.rating - a.rating)
            .map((book) => book.id)
            .slice(0, 10),
          mostPopular: libData.mostPopular.slice(0, 10),
        }),
      ),
    );
  }
}

let libraries;
(async () => {
  const PORT = process.env.PORT || 3000; // Replit sets PORT automatically
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

  libraries = JSON.parse(fs.readFileSync("./libs.json", "utf8"));
  //processing which books, books being processed cant recive any more edits until the processing is done
  libraries.forEach((element) => (element.processing = []));

  UpdateLibraries();
  setInterval(UpdateLibraries, 60000 * 60);
})();
