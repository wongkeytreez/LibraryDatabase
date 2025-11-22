async function Start3(isServer) {
  main.style.pointerEvents = "none";
  const libName = document.getElementById("libName").value;
  const libPassword = isServer
    ? document.getElementById("libPassword").value
    : "";
  if (libPassword == null) return Start2(isServer, "please enter library name");

  if (isServer) {
    if (libPassword == null) return Start2(isServer, "please enter password");
    const cookieData = await RequestCookie(libName, libPassword);
    if ("error" in cookieData) return Start2(isServer, cookieData.error);
    fps = cookieData.fps;
    ImagesPerVideo = cookieData.ImagesPerVideo;
  } else {
    if ((await getLibrary(libName)).error)
      return Start2(isServer, "couldnt find specified library");
  }

  main.innerHTML = "";
  if (isServer) {
    main.style.width = "80%";
    sidebar.style.width = "20%";
  } else {
    main.style.width = "95%";
    sidebar.style.width = "5%";
  }

  sidebar.style.height = "100%";
  sidebar.style.backgroundColor = "rgb(60, 51, 80)";

  setUpSidebar(isServer);
  ReloadMain(libName, isServer);
  isserver = isServer;
  libname = libName;
  main.style.pointerEvents = "";
}

function setUpSidebar(isServer) {
  sidebar.innerHTML = "";
  Object.assign(sidebar.style, {
    display: "flex",

    alignItems: "flex-start",
    borderTopRightRadius: "2rem",
    borderBottomRightRadius: "2rem",
    boxShadow: "inset -2rem 0 4rem rgba(255, 255, 255, 0.05)",
    borderRight: "0.5rem solid rgba(255,255,255,0.08)",
  });
  const listslist = document.createElement("div");
  if (isServer) {
    Object.assign(listslist.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      height: "100%",
      width: "25%",
      margin: 0,
      paddingTop: "3rem",
      gap: "2rem",
    });
    const video = document.createElement("div");
    video.style.width = "100%";
    video.id = "imageDiv";

    runCamera();
    const buttonsDiv = document.createElement("div");
    Object.assign(buttonsDiv.style, {
      width: "100%",
      display: "flex",
      flexGrow: "1",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
    });
    const leftcontainer = document.createElement("div");
    leftcontainer.style.width = "75%";
    leftcontainer.style.height = "100%";
    leftcontainer.style.display = "flex";

    leftcontainer.style.flexDirection = "column";
    //buton group
    const buttons = createButtonGroup();
    const details = document.createElement("div");
    buttonsDiv.appendChild(buttons.group);
    buttonsDiv.appendChild(details);
    buttonsDiv.style.position = "relative";
    buttons.group.style.flexWrap = "wrap";
    details.style.width = "100%";

    details.style.height = "40%";

    // --------BUTTONS---------
    buttons.addButton(
      "addbook (ISBN)",
      { maxWidth: "95%" },
      () => {
        details.innerHTML = "";

        const isbnInput = document.createElement("input");
        Object.assign(isbnInput.style, {
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.3rem",
          border: "1px solid #ccc",
          width: "12rem",
          display: "block",
          marginBottom: "1rem",
          maxWidth: "95%",
        });
        details.appendChild(isbnInput);

        let timeout;

        isbnInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            isbnInput.value = "";
          }, 5000);
        });

        isbnInput.addEventListener("keydown", async (e) => {
          if (e.key !== "Enter") return;

          details.innerHTML = "";
          details.appendChild(isbnInput);
          isbnInput.value = isbnInput.value.replace(/\D/g, "");
          clearTimeout(timeout);

          const loading = document.createElement("p");
          loading.textContent = "Fetching book info...";
          details.appendChild(loading);

          let book;
          try {
            book = await GetISBNBook(isbnInput.value);
          } catch {
            loading.textContent = "Error fetching book data.";
            return;
          }

          if (!book || book.error) {
            loading.style.color = "red";
            loading.textContent = "Book not found or invalid ISBN.";
            return;
          }

          loading.remove();

          const bookinfo = document.createElement("div");
          Object.assign(bookinfo.style, {
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "0.5rem",
            background: "#f9f9f9",
            marginBottom: "1rem",
          });

          bookinfo.innerHTML = `
            <img src="${book.cover}" style="width:5rem;height:auto;border-radius:0.3rem;">
            <div>
                <h3 style="margin:0;font-size:1.1rem;">${book.title}</h3>
                <p style="margin:0.2rem 0 0;color:#555;">${book.authors}</p>
            </div>
        `;

          const confirmButton = document.createElement("button");
          confirmButton.textContent = "Add Book";
          Object.assign(confirmButton.style, {
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "0.3rem",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
          });

          confirmButton.onclick = async () => {
            confirmButton.disabled = true;
            confirmButton.textContent = "Adding...";

            try {
              const data = await AddBook(
                book.title,
                isbnInput.value,
                book.genres,
                book.desc,
                book.cover,
                book.authors
              );
              if (data.error) return (confirmButton.textContent = data.error);
              confirmButton.textContent = "Added!";
            } catch (e) {
              console.log(e);
              confirmButton.textContent = "Failed. Try again.";
              confirmButton.disabled = false;
            }
          };

          details.append(bookinfo, confirmButton);
        });
      },
      () => {
        details.innerHTML = "";
      }
    );
    buttons.addButton(
      "addbook (manual)",
      { maxWidth: "95%" },
      () => {
        details.innerHTML = "";

        const form = document.createElement("div");
        Object.assign(form.style, {
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          padding: "1rem",
          width: "auto",
          maxWidth: "calc(100% - 2rem)",
          maxHeight: "90%",
          overflow: "auto",
          flex: "1 0 auto",
        });

        // Helper to make inputs
        const makeInput = (placeholder) => {
          const input = document.createElement("input");
          Object.assign(input.style, {
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            borderRadius: "0.3rem",
            border: "1px solid #ccc",
            width: "100%",
            boxSizing: "border-box",
          });
          input.placeholder = placeholder;
          return input;
        };
        const idInput = makeInput("book ID");
        const titleInput = makeInput("Title");
        const authorsInput = makeInput("Authors (separate by comma)");
        const genresInput = makeInput("Genres (separate by comma)");

        const descInput = document.createElement("textarea");
        Object.assign(descInput.style, {
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.3rem",
          border: "1px solid #ccc",
          height: "8rem",
          resize: "vertical",
          width: "100%",
          boxSizing: "border-box",
          flexShrink: "0",
        });
        descInput.placeholder = "Description";

        // Image area
        const imageArea = document.createElement("div");
        Object.assign(imageArea.style, {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          padding: "0.5rem",
          background: "#f9f9f9",
        });

        const previewImg = document.createElement("img");
        Object.assign(previewImg.style, {
          maxWidth: "10rem",
          maxHeight: "10rem",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          background: "#fff",
          borderRadius: "0.3rem",
        });
        imageArea.appendChild(previewImg);

        const imgButtonRow = document.createElement("div");
        Object.assign(imgButtonRow.style, {
          display: "flex",
          gap: "0.5rem",
        });

        // Create elements
        const imgBtn1 = document.createElement("button");
        imgBtn1.textContent = "Select Image";

        const imgBtn2 = document.createElement("button");
        imgBtn2.textContent = "Take Picture with Camera";

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let cameraInterval;
        const baseButton2Onclick = () => {
          if (cameraInterval) clearInterval(cameraInterval); // reset if already running

          cameraInterval = setInterval(() => {
            if (ImagesList.length === 0) return;
            canvas.width = ImagesList[ImagesList.length - 1].width;
            canvas.height = ImagesList[ImagesList.length - 1].height;
            ctx.putImageData(ImagesList[ImagesList.length - 1], 0, 0);
            previewImg.src = canvas.toDataURL();
          }, 1000 / fps);
          imgBtn1.textContent = "take picture";
          const boundimg = () => {
            const currentImg = previewImg.src;
            clearInterval(cameraInterval);
            imgBtn1.textContent = "confirm";
            imgBtn2.textContent = "cancel";
            requestAnimationFrame(() => {
              const { getCroppedImage, removeBox } =
                createBoundingBox(previewImg);
              imgBtn1.onclick = () => {
                previewImg.src = getCroppedImage();
                removeBox();
                requestAnimationFrame(() => {
                  imgBtn1.onclick = () => {
                    requestAnimationFrame(() => {
                      imgBtn1.onclick = baseButton1Onclick;
                      imgBtn2.onclick = baseButton2Onclick;
                      imgBtn1.textContent = "Select Image";
                      imgBtn2.textContent = "Take Picture with Camera";
                    });
                  };
                  imgBtn2.onclick = () => {
                    previewImg.src = currentImg;
                    boundimg();
                  };
                });
              };
              imgBtn2.onclick = () => {
                removeBox();
                baseButton2Onclick();
              };
            });
          };
          imgBtn1.onclick = boundimg;
          imgBtn2.textContent = "cancel";
          requestAnimationFrame(() => {
            imgBtn2.onclick = () => {
              imgBtn1.onclick = baseButton1Onclick;
              imgBtn2.onclick = baseButton2Onclick;
              imgBtn1.textContent = "Select Image";
              imgBtn2.textContent = "Take Picture with Camera";
              clearInterval(cameraInterval);
            };
          });
        };

        const baseButton1Onclick = () => {
          if (cameraInterval) clearInterval(cameraInterval); // stop camera updates
          fileInput.click();
        };

        // File picker button
        imgBtn1.onclick = baseButton1Onclick;
        // Handle file selection
        fileInput.onchange = () => {
          const file = fileInput.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImg.src = e.target.result;
          };
          reader.readAsDataURL(file);
        };

        // Camera capture button
        imgBtn2.onclick = baseButton2Onclick;

        imgButtonRow.append(imgBtn1, imgBtn2);
        imageArea.appendChild(imgButtonRow);

        const submitButton = document.createElement("button");
        submitButton.textContent = "Add Book";
        Object.assign(submitButton.style, {
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "0.3rem",
          background: "#007bff",
          color: "white",
          cursor: "pointer",
          alignSelf: "center",
          marginTop: "0.5rem",
        });

        submitButton.onclick = async () => {
          submitButton.disabled = true;
          submitButton.textContent = "Adding...";

          const book = {
            title: titleInput.value.trim(),
            authors: authorsInput.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            genres: genresInput.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            desc: descInput.value.trim(),
            cover: dataURLToBlob(previewImg.src),
            id: idInput.value.replace(/\D/g, ""),
          };

          try {
            const data = await AddBook(
              book.title,
              book.id,
              book.genres,
              book.desc,
              book.cover,
              book.authors
            );
            if (data.error) {
              submitButton.textContent = data.error;
              submitButton.disabled = false;
              return;
            }
            submitButton.textContent = "Added!";
          } catch (e) {
            console.log(e);
            submitButton.textContent = "Failed. Try again.";
            submitButton.disabled = false;
          }
        };

        form.append(
          idInput,
          titleInput,
          authorsInput,
          genresInput,
          descInput,
          imageArea,
          submitButton
        );
        details.appendChild(form);
      },
      () => {
        details.innerHTML = "";
      }
    );
    buttons.addButton(
      "borrow book",
      { maxWidth: "95%" },
      () => {
        details.innerHTML = "";

        const isbnInput = document.createElement("input");
        Object.assign(isbnInput.style, {
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.3rem",
          border: "1px solid #ccc",
          width: "12rem",
          display: "block",
          marginBottom: "1rem",
          maxWidth: "95%",
        });
        details.appendChild(isbnInput);

        let timeout;

        isbnInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            isbnInput.value = "";
          }, 5000);
        });

        isbnInput.addEventListener("keydown", async (e) => {
          if (e.key !== "Enter") return;

          details.innerHTML = "";
          details.appendChild(isbnInput);
          const id = isbnInput.value.replace(/\D/g, "");
          isbnInput.value = "";
          clearTimeout(timeout);

          const loading = document.createElement("p");
          loading.textContent = "taking video....";
          details.appendChild(loading);

          let book;
          try {
            book = await getBook(libname, id);
          } catch {
            loading.style.color = "red";
            loading.textContent = "Error fetching book data.";
            return;
          }

          if (!book || book.error) {
            loading.style.color = "red";
            loading.textContent = "Error fetching book data.";
            return;
          }
          if (
            book.history.length > 0 &&
            book.history[book.history.length - 1].end == null
          ) {
            loading.style.color = "red";
            loading.textContent = "book unavailible";
            return;
          }
          const reply = await borrowBook(id);
          if (reply.error) {
            loading.style.color = "red";
            loading.textContent = reply.error;
          }
          loading.style.color = "green";
          loading.textContent = "sucsessfully borrowed";
        });
      },
      () => {
        details.innerHTML = "";
      }
    );
    buttons.addButton(
      "return book",
      { maxWidth: "95%" },
      () => {
        details.innerHTML = "";

        const isbnInput = document.createElement("input");
        Object.assign(isbnInput.style, {
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.3rem",
          border: "1px solid #ccc",
          width: "12rem",
          display: "block",
          marginBottom: "1rem",
          maxWidth: "95%",
        });
        details.appendChild(isbnInput);

        let timeout;

        isbnInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            isbnInput.value = "";
          }, 5000);
        });

        isbnInput.addEventListener("keydown", async (e) => {
          if (e.key !== "Enter") return;

          details.innerHTML = "";
          details.appendChild(isbnInput);
          const id = isbnInput.value.replace(/\D/g, "");
          isbnInput.value = "";
          clearTimeout(timeout);

          const loading = document.createElement("p");

          details.appendChild(loading);

          let book;
          try {
            book = await getBook(libname, id);
          } catch {
            loading.style.color = "red";
            loading.textContent = "Error fetching book data.";
            return;
          }

          if (!book || book.error) {
            loading.style.color = "red";
            loading.textContent = "Error fetching book data.";
            return;
          }
          if (
            book.history.length == 0 ||
            book.history[book.history.length - 1].end != null
          ) {
            loading.style.color = "red";
            loading.textContent = "book hasn't been been borrowed yet";
            return;
          }
          const reply = await Return(id);
          if (reply.error) {
            loading.style.color = "red";
            loading.textContent = reply.error;
          }
          loading.style.color = "green";
          loading.textContent = "sucsessfully returned";
          //   loading.remove();
        });
      },
      () => {
        details.innerHTML = "";
      }
    );
    leftcontainer.appendChild(video);
    leftcontainer.appendChild(buttonsDiv);

    sidebar.appendChild(leftcontainer);
  } else {
    Object.assign(listslist.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      height: "100%",
      width: "100%",
      margin: 0,
      paddingTop: "3rem",
      gap: "2rem",
    });
  }
  const icon3 = document.createElement("img");
  icon3.src = "images/MostPopular.png";
  icon3.onclick = () => {
    document.getElementById("MostPopularList").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  icon3.classList.add("icon");
  icon3.style.width = "100%";
  listslist.appendChild(icon3);

  const icon4 = document.createElement("img");
  icon4.src = "images/MostPopularISBN.png";
  icon4.onclick = () => {
    document.getElementById("MostPopularISBNList").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  icon4.classList.add("icon");
  icon4.style.width = "100%";
  listslist.appendChild(icon4);

  const icon1 = document.createElement("img");
  icon1.src = "images/HighestRated.png";
  icon1.onclick = () => {
    document.getElementById("HighestRatedList").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  icon1.classList.add("icon");
  icon1.style.width = "100%";
  listslist.appendChild(icon1);

  const icon2 = document.createElement("img");
  icon2.src = "images/HighestRatedISBN.png";
  icon2.onclick = () => {
    document.getElementById("HighestRatedISBNList").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  icon2.classList.add("icon");
  icon2.style.width = "100%";
  listslist.appendChild(icon2);

  const icon5 = document.createElement("img");
  icon5.src = "images/listOfAllBooks.png";
  icon5.onclick = () => {
    document.getElementById("allBooksList").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  icon5.classList.add("icon");
  icon5.style.width = "100%";
  listslist.appendChild(icon5);

  sidebar.appendChild(listslist);
}

async function ReloadMain(libName = libname, isServer = isserver) {
  main.innerHTML = "";
  const library = await getLibrary(libName);
  console.log(library);
  const bookLists = document.createElement("div");
  Object.assign(bookLists.style, {
    width: "calc(100% - 2rem)",
    height: "calc(100% - 2rem)",
    overflow: "auto",
    padding: "1rem",
    flexDirection: "column",
    gap: "5rem",
  });

  //most popular books
  const MostPopular = document.createElement("div");
  MostPopular.id = "MostPopularList";
  Object.assign(MostPopular.style, {
    width: "calc(100% - 4rem)",

    padding: "2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "3rem",
    alignItems: "center",
    justifyContent: "center",
  });
  MostPopular.innerHTML = `<div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of the most popular books in ${libName}</h1></div>`;
  for (const book of library.mostPopular)
    MostPopular.appendChild(
      Book(
        isServer ? "40vw" : "47.5vw",
        library.books.find((b) => b.id == book.id),
        libName
      )
    );

  //most popular isbn books
  const MostPopularISBN = document.createElement("div");
  MostPopularISBN.id = "MostPopularISBNList";
  Object.assign(MostPopularISBN.style, {
    width: "calc(100% - 4rem)",

    padding: "2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "3rem",
    alignItems: "center",
    justifyContent: "center",
  });
  MostPopularISBN.innerHTML = `<div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
">List of the most popular ISBN books in ${libName}</h1></div>`;
  for (const book of library.mostPopularISBN)
    MostPopularISBN.appendChild(
      Book(
        isServer ? "40vw" : "47.5vw",
        library.books.find((b) => b.id == book),
        libName
      )
    );

  //highest rated books
  const HighestRated = document.createElement("div");
  HighestRated.id = "HighestRatedList";
  Object.assign(HighestRated.style, {
    width: "calc(100% - 4rem)",

    padding: "2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "3rem",
    alignItems: "center",
    justifyContent: "center",
  });
  HighestRated.innerHTML = ` <div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of the highest rated books in ${libName}</h1></div>`;
  for (const book of library.highestRatedBooks || [])
    HighestRated.appendChild(
      Book(
        isServer ? "40vw" : "47.5vw",
        library.books.find((b) => b.id == book),
        libName
      )
    );

  //highest rated isbn books
  const HighestRatedISBN = document.createElement("div");
  HighestRatedISBN.id = "HighestRatedISBNList";
  Object.assign(HighestRatedISBN.style, {
    width: "calc(100% - 4rem)",

    padding: "2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "3rem",
    alignItems: "center",
    justifyContent: "center",
  });
  HighestRatedISBN.innerHTML = ` <div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of the highest rated ISBN books in ${libName}</h1></div>`;
  for (const book of library.highestRatedBooksISBN)
    HighestRatedISBN.appendChild(
      Book(
        isServer ? "40vw" : "47.5vw",
        library.books.find((b) => b.id == book),
        libName
      )
    );

  //all books
  const AllBooks = document.createElement("div");
  AllBooks.id = "allBooksList";
  Object.assign(AllBooks.style, {
    width: "calc(100% - 4rem)",

    padding: "2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "3rem",
    alignItems: "center",
    justifyContent: "center",
  });
  AllBooks.innerHTML = `
<div style="width:100%;display:flex; flex-direction:column; align-items:center; gap:1rem;">
  <h1 style="
    display: inline-block;
    font-family: 'Montserrat', sans-serif;
    background: white;
    border: 0.2rem solid rgba(0,0,0,0.2);
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    box-sizing: border-box;
  ">List of all books in ${libName}</h1>

  <input id="BookSearchBar" placeholder="Search..." 
    style="padding:0.5rem 1rem; width:80%; max-width:400px;
           border:0.2rem solid rgba(0,0,0,0.2);
           border-radius:0.4rem; font-size:1rem;">
</div>
`;
  requestAnimationFrame(() => {
    const searchBar = document.getElementById("BookSearchBar");
    let SavedDistances = {}; // distance map stays between searches

    searchBar.addEventListener("input", () => {
      const query = searchBar.value.trim();

      if (query.length === 0) {
        SavedDistances = {};
        return;
      }

      // compute/refresh distances
      const results = SmartSearch(
        query,
        library.books.map((book) => book.title),
        SavedDistances
      );

      // update saved distance map
      SavedDistances = results.map;

      // filter: distance must be <= half the query length
      const maxDist = Math.floor(query.length / 3) + 1;

      const filtered = results.sorted.filter((name) => {
        return results.distances[name] <= maxDist;
      });

      let header = searchBar.parentElement;
      //remove old books
      while (AllBooks.children.length > 1) {
        if (AllBooks.children[0] === header) {
          AllBooks.removeChild(AllBooks.children[1]);
        } else {
          AllBooks.removeChild(AllBooks.children[0]);
        }
      }

      //add new books
      for (const bookTitle of filtered)
        AllBooks.appendChild(
          Book(
            isServer ? "40vw" : "47.5vw",
            library.books.find((book) => book.title == bookTitle),
            libName
          )
        );
    });
  });
  for (const book of library.books)
    AllBooks.appendChild(Book(isServer ? "40vw" : "47.5vw", book, libName));

  bookLists.appendChild(MostPopular);
  bookLists.appendChild(MostPopularISBN);
  bookLists.appendChild(HighestRated);
  bookLists.appendChild(HighestRatedISBN);
  bookLists.appendChild(AllBooks);
  main.appendChild(bookLists);
}

function Book(pageCenter, contents, libName) {
  const base = document.createElement("div");
  Object.assign(base.style, {
    width: "13rem",
    height: "18rem",
    boxShadow: "0 1rem 2.5rem rgba(0, 0, 0, 0.25)",
    borderRadius: "1rem",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top", // vertical spacing
    alignItems: "center", // centers horizontally
    backgroundColor: "white",
    position: "relative",
  });

  const img = document.createElement("img");

  img.src = GithubLink + libName + "/" + contents.id + "/cover.jpg";

  Object.assign(img.style, {
    maxHeight: "50%",
    maxWidth: "80%",
    marginTop: "1rem",
  });
  base.appendChild(img);

  const metadata = document.createElement("div");
  metadata.innerHTML = `
<h2 style="
  font-size:1rem;
  overflow:hidden;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  white-space:normal;
  flex-shrink:0;margin:0.5rem;
">
  ${contents.title}
</h2>

<h1 style="color:${
    contents.availible == true ? "green" : "red"
  };font-size:1rem;margin:0">${
    contents.availible == true ? "Availible" : "Unavailible"
  }</h2>
<p style="margin:0.3rem;font-size:0.8rem;">Author:${contents.authors[0]}</p>
<p style="margin:0;font-size:0.8rem;">Genre:${contents.genres[0]}</p>
`;
  Object.assign(metadata.style, {
    height: "45%",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // centers horizontally
  });
  base.appendChild(metadata);
  if (isserver)
    base.innerHTML += ` <img src="images/pencil.png" style="position:absolute;top:10px;right:10px;width:40px;height:40px;background:white;border-radius:50%;display:flex;justify-content:center;align-items:center;font-size:20px;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);">`;
  const editButton = base.children[base.children.length - 1];
  editButton.style.transition = "opacity 1000ms";
  let ghost;
  let descBase;
  let histbase;
  editButton.onclick = editBook;
  base.onclick = async () => {
    //check whether this book is already in the middle, if position is absolute, its currently in the middle
    if (base.style.position != "absolute") showBook();
    else hideBook();
  };
  async function editBook(event) {
    event.stopPropagation();
    showBook(true);
  }
  async function showBook(isEditing) {
    editButton.onclick = null;
    editButton.style.opacity = "0";
    const bookData = await getBook(libName, contents.id);
    const histories = bookData.history;
    console.log(bookData);
    ghost = document.createElement("div");
    base.replaceWith(ghost);
    main.appendChild(base);
    base.style.position = "absolute";
    Object.assign(ghost.style, {
      width:
        "calc(" +
        base.style.width +
        " + " +
        base.style.padding +
        " + " +
        base.style.padding +
        ")",
      height:
        "calc(" +
        base.style.height +
        " + " +
        base.style.padding +
        " + " +
        base.style.padding +
        ")",
    });

    ghost.parentElement.parentElement.style.pointerEvents = "none";
    ghost.parentElement.parentElement.style.transition = `opacity ${500}ms ease`;
    ghost.parentElement.parentElement.style.opacity = "0";

    base.style.opacity = "1";
    base.style.zIndex = (3 + histories.length).toString();
    base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`;

    base.style.left = ghost.offsetLeft + "px";
    base.style.top =
      ghost.offsetTop - ghost.parentElement.parentElement.scrollTop + "px";
    requestAnimationFrame(() => {
      base.style.left = `calc(${pageCenter} - 7.5rem)`;
      base.style.top = `10rem`;
    });

    base.style.pointerEvents = "none";
    await sleep(1000);

    descBase = document.createElement("div");
    descBase.style.textAlign = "left";
    descBase.style.cssText = base.style.cssText;
    descBase.style.zIndex = "2";
    descBase.style.overflowY = "auto";
    descBase.style.overflowX = "hidden";
    main.appendChild(descBase);
    base.style.left = `calc(${pageCenter} - 25rem)`;
    if (!isEditing)
      descBase.onclick = async () => {
        hideBook();
      };

    if (!isEditing) {
      descBase.innerHTML = `
    <h4 style="margin:0.5rem;width:90%">${bookData.title}</h4>
    <p style="margin:0.3rem;width:90%"><strong>ID:</strong> ${contents.id}</p>
    <p style="margin:0.3rem;width:90%"><strong>Authors:</strong> ${contents.authors}</p>
    <p style="margin:0.3rem;width:90%"><strong>Genres:</strong> ${contents.genres}</p>
    <p style="margin:0.5rem;width:90%"><strong>Description:</strong></p>
    <p style="margin:0.3rem;width:90%">${bookData.desc}</p>
  `;
    } else {
      descBase.innerHTML = `
    <h3 style="margin:0.5rem;width:90%">Edit Book</h3>

    <label>Title</label>
    <input id="titleinput" type="text" style="width:90%;margin:0.2rem" value="${bookData.title}">

    <p style="margin:0.3rem;width:90%"><strong>ID:</strong> ${contents.id}</p>

    <label>Authors</label>
    <input id="authorinput" type="text" style="width:90%;margin:0.2rem" value="${contents.authors}">

    <label>Genres</label>
    <input id="genreinput"type="text" style="width:90%;margin:0.2rem" value="${contents.genres}">

    <label>Description</label>
    <textarea id="descinput" style="width:90%;margin:0.2rem;flex-shrink:0">${bookData.desc}</textarea>
    <label>Password</label>
    <input id="passwordinput" style="width:90%;height;margin:0.2rem"></input>
    <button id="descbaseSubmit"style="margin:0.5rem;padding:0.4rem 1rem">Save</button>
  `;
      document.getElementById("descbaseSubmit").onclick = () => {
        const result = EditBook(
          bookData.id,
          {
            title: document.getElementById("titleinput").value,
            authors: document.getElementById("authorinput").value,
            genres: document.getElementById("genreinput").value,
            desc: document.getElementById("descinput").value,
          },
          document.getElementById("passwordinput").value
        );
        if (result.error) {
          descBase.innerHTML += "<p>result.error</p>";
        }
      };
      const desc = document.getElementById("descinput");
      // auto resize on load
      desc.style.height = "auto";
      desc.style.height = `calc(${desc.scrollHeight + "px"} - 0.4rem)`;

      // auto resize when typing
      desc.addEventListener("input", () => {
        desc.style.height = "auto";
        desc.style.height = `calc(${desc.scrollHeight + "px"} - 0.4rem)`;
      });
    }

    await sleep(1000);
    base.style.transition = ``;
    descBase.style.transition = ``;

    histbase = document.createElement("div");
    main.appendChild(histbase);
    Object.assign(histbase.style, {
      width: "calc(100% - 4rem)",

      padding: "2rem",
      display: "flex",
      flexWrap: "wrap",
      gap: "3rem",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      transform: "-50% 0",
      top: "calc(" + base.style.top + " + 20rem)",
    });

    for (const history of histories) {
      const currentBase = document.createElement("div");
      Object.assign(currentBase.style, {
        width: "13rem",
        height: "13rem",
        boxShadow: "0 1rem 2.5rem rgba(0, 0, 0, 0.25)",
        borderRadius: "1rem",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        opacity: "0",
        // smooth animation
        pointerEvents: "none",
      });

      currentBase.addEventListener("mouseenter", () => {
        currentBase.style.zIndex = (2 + histories.length).toString();
        currentBase.style.transition = "transform 0.3s ease";
        currentBase.style.transform = "scale(1.5)"; // grow by 10%
      });

      currentBase.addEventListener("mouseleave", () => {
        currentBase.style.zIndex = (2).toString();
        currentBase.style.transform = "scale(1)"; // back to normal
      });

      histbase.appendChild(currentBase);
      const video = document.createElement("video");
      video.src =
        GithubLink +
        libName +
        "/" +
        contents.id +
        "/videos/" +
        history.start +
        ".mp4";
      video.muted = true;
      video.loop = true;
      video.autoplay = false; // optional, just to be explicit

      video.addEventListener("loadeddata", () => {
        video.currentTime = history.thumbnailFrame || 0;
        video.pause();
      });

      video.addEventListener("mouseenter", () => video.play());

      video.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = history.thumbnailFrame || 0;
      });
      video.style.maxHeight = "75%";
      video.style.maxWidth = "95%";
      currentBase.appendChild(video);
      const borrowedTime = new Date(history.start); // example timestamp
      const returnedTime = new Date(history.end); // can be null

      // readable dates
      const borrowedStr = borrowedTime.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const returnedStr = history.end
        ? returnedTime.toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Not returned yet";

      // time difference (in ms)
      const diff = history.end
        ? returnedTime - borrowedTime
        : Date.now() - borrowedTime;
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60));

      const timeBorrowed = `${hours}h ${minutes}m ${seconds}s`;

      // create box
      const infoBox = document.createElement("div");
      Object.assign(infoBox.style, {
        maxHeight: "25%",
        maxWidth: "95%",
        fontSize: "0.76rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
        textAlign: "center",
      });

      infoBox.innerHTML = `
  <div><b>Borrowed:</b> ${borrowedStr}</div>
  <div><b>Returned:</b> ${returnedStr}</div>
  <div><b>Duration:</b> ${timeBorrowed}</div>
`;

      // append to currentBase
      currentBase.appendChild(infoBox);
    }

    for (i = 0; i < histories.length; i++) {
      histories[i].pos = {
        top: histbase.children[i].offsetTop,
        left: histbase.children[i].offsetLeft,
      };
    }

    for (i = 0; i < histories.length; i++) {
      histbase.children[i].style.top = "-20rem";
      histbase.children[i].style.left =
        "calc(" + histbase.offsetWidth / 2 + "px - 7.5rem)";
      histbase.children[i].style.opacity = "1";
      histbase.children[i].style.zIndex = (2 + histories.length - i).toString();

      histbase.children[i].style.position = "absolute";
      histbase.children[
        i
      ].style.transition = `left ${1000}ms ease, top ${1000}ms ease`;
    }

    for (i = 0; i < histories.length; i++) {
      histbase.children[i].style.top = histories[i].pos.top + "px";
      histbase.children[i].style.left = histories[i].pos.left + "px";
      await sleep(1000 / histories.length);
    }
    await sleep(1000 - 1000 / histories.length);
    for (i = 0; i < histories.length; i++) {
      histbase.children[i].style.position = "";
      histbase.children[i].style.pointerEvents = "";
    }
    base.style.pointerEvents = "";
    descBase.style.pointerEvents = "";
  }

  async function hideBook() {
    editButton.onclick = editBook;
    editButton.style.opacity = "1";
    base.style.pointerEvents = "none";
    descBase.style.pointerEvents = "none";
    for (const history of histbase.children) {
      history.style.pointerEvents = "none";

      history.style.top = history.offsetTop + "px";
      history.style.left = history.offsetLeft + "px";
    }
    for (const history of histbase.children) {
      history.style.transition = `left ${1000}ms ease, top ${1000}ms ease`;
      history.style.position = "absolute";
      if (Math.random() > 0.5) {
        history.style.left = "-15rem";
      } else {
        history.style.left = "100vw";
      }
    }
    await sleep(1000);
    for (const history of histbase.children) {
      history.style.transition = "";
      history.style.top = "-55rem";
      history.style.left = descBase.style.left;
    }
    for (i = 0; i < histbase.children.length; i++) {
      requestAnimationFrame(() => {
        histbase.children[
          i
        ].style.transition = `left ${1000}ms ease, top ${1000}ms ease`;
        histbase.children[i].style.top = "-20rem";
        histbase.children[i].style.zIndex = (3 + i).toString();
      });

      await sleep(1000 / histbase.children.length);
    }
    await sleep(1000 - 1000 / histbase.children.length);
    base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`;
    base.style.left = "calc(" + pageCenter + " - " + "7.5rem)";

    await sleep(1000);
    histbase.remove();
    histbase = "";
    descBase.remove();
    descBase = "";
    console.log(ghost.offsetLeft);
    base.style.top =
      ghost.offsetTop - ghost.parentElement.parentElement.scrollTop + "px";
    base.style.left = ghost.offsetLeft + "px";
    await sleep(500);
    ghost.parentElement.parentElement.style.opacity = "1";
    await sleep(500);
    base.style.position = "";
    ghost.replaceWith(base);
    ghost.remove();
    ghost = "";
    base.parentElement.parentElement.style.pointerEvents = "";
    base.style.pointerEvents = "";
    base.style.zIndex = "";
    base.style.position = "relative";
    base.style.top = null;
    base.style.left = null;
  }

  return base;
}

function createButtonGroup() {
  const group = document.createElement("div");
  group.style.display = "flex";
  group.style.gap = "0.5rem";

  let activeButton = null;

  function addButton(
    text,
    style = {},
    callback = () => {},
    cancelcall = () => {}
  ) {
    const btn = document.createElement("button");
    btn.textContent = text;

    // base style
    Object.assign(btn.style, {
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "0.5rem",
      background: "#3a5ccf",
      color: "white",
      cursor: "pointer",
      opacity: 1,
      transition: "opacity 0.2s, filter 0.2s",
      ...style,
    });

    btn.onclick = () => {
      if (activeButton) activeButton.style.opacity = 1;
      btn.style.opacity = 0.6; // pressed look
      if (activeButton == btn) {
        btn.style.opacity = 1;
        activeButton = null;
        cancelcall();
      } else {
        activeButton = btn;
        callback();
      }
    };

    group.appendChild(btn);
    return btn;
  }

  return { group, addButton };
}
function createBoundingBox(img) {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.display = "inline-block";
  img.parentNode.insertBefore(container, img);
  container.appendChild(img);

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute",
    border: "2px solid red",
    top: "20%",
    left: "20%",
    width: "40%",
    height: "40%",
    boxSizing: "border-box",
  });
  container.appendChild(box);

  // Create 4 corner handles
  const corners = ["nw", "ne", "sw", "se"];
  const handles = {};
  for (const c of corners) {
    const handle = document.createElement("div");
    Object.assign(handle.style, {
      position: "absolute",
      width: "10px",
      height: "10px",
      background: "red",
      borderRadius: "50%",
      cursor:
        c === "nw"
          ? "nwse-resize"
          : c === "ne"
          ? "nesw-resize"
          : c === "sw"
          ? "nesw-resize"
          : "nwse-resize",
    });
    box.appendChild(handle);
    handles[c] = handle;
  }

  // Position handles
  function updateHandlePositions() {
    const w = box.offsetWidth,
      h = box.offsetHeight;
    handles.nw.style.left = "-5px";
    handles.nw.style.top = "-5px";
    handles.ne.style.right = "-5px";
    handles.ne.style.top = "-5px";
    handles.sw.style.left = "-5px";
    handles.sw.style.bottom = "-5px";
    handles.se.style.right = "-5px";
    handles.se.style.bottom = "-5px";
  }
  updateHandlePositions();

  let isDragging = false,
    dragTarget = null,
    offsetX = 0,
    offsetY = 0;

  // Move whole box
  box.addEventListener("mousedown", (e) => {
    if (Object.values(handles).includes(e.target)) return; // skip handles
    isDragging = "move";
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  // Resize corners
  for (const [pos, handle] of Object.entries(handles)) {
    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      isDragging = pos;
    });
  }

  document.addEventListener("mouseup", () => (isDragging = false));

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();

    let left = boxRect.left - rect.left;
    let top = boxRect.top - rect.top;
    let width = boxRect.width;
    let height = boxRect.height;

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging === "move") {
      let x = e.clientX - rect.left - offsetX;
      let y = e.clientY - rect.top - offsetY;
      x = Math.max(0, Math.min(x, rect.width - width));
      y = Math.max(0, Math.min(y, rect.height - height));
      Object.assign(box.style, { left: x + "px", top: y + "px" });
    } else {
      // resizing
      if (isDragging.includes("n")) {
        const bottom = top + height;
        top = Math.min(Math.max(0, my), bottom - 20);
        height = bottom - top;
      }
      if (isDragging.includes("s")) {
        height = Math.max(20, Math.min(rect.height - top, my - top));
      }
      if (isDragging.includes("w")) {
        const right = left + width;
        left = Math.min(Math.max(0, mx), right - 20);
        width = right - left;
      }
      if (isDragging.includes("e")) {
        width = Math.max(20, Math.min(rect.width - left, mx - left));
      }
      Object.assign(box.style, {
        left: left + "px",
        top: top + "px",
        width: width + "px",
        height: height + "px",
      });
    }
    updateHandlePositions();
  });

  function getCroppedImage() {
    const rect = box.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    const cropX = (rect.left - imgRect.left) * scaleX;
    const cropY = (rect.top - imgRect.top) * scaleY;
    const cropW = rect.width * scaleX;
    const cropH = rect.height * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return canvas.toDataURL("image/png");
  }

  function removeBox() {
    observer.disconnect();
    box.remove();
    if (container.childNodes.length === 1) {
      container.replaceWith(img);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.removedNodes) {
        if (node === img) {
          removeBox();
          return;
        }
      }
    }
  });
  observer.observe(container, { childList: true });

  return { getCroppedImage, removeBox };
}
function dataURLToBlob(dataURL) {
  const [header, base64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}
