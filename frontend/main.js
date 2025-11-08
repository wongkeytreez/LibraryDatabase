async function Start3(isServer) {
    main.style.pointerEvents="none"
    const libName = (document.getElementById("libName")).value
    const libPassword = (isServer) ? (document.getElementById("libPassword")).value : ""
    if (libPassword == null) return Start2(isServer, "please enter library name")

    if (isServer) {
        if (libPassword == null) return Start2(isServer, "please enter password")
        const cookieData = await RequestCookie(libName, libPassword);
        if ("error" in cookieData) return Start2(isServer, cookieData.error);
        fps = cookieData.fps;
        ImagesPerVideo = cookieData.ImagesPerVideo;
    } else {
        if ((await getLibrary(libName)).error) return Start2(isServer, "couldnt find specified library")
    }

    main.innerHTML = "";
    if (isServer) {
        main.style.width = "80%"
        sidebar.style.width = "20%";

      


    } else {
        main.style.width = "95%"
        sidebar.style.width = "5%";

    }

    sidebar.style.height = "100%";
    sidebar.style.backgroundColor = "rgb(60, 51, 80)"
    setUpSidebar(isServer);
    ReloadMain(libName, isServer)
    isserver = isServer
    libname=libName;
    main.style.pointerEvents=""
}

function setUpSidebar(isServer) {
    sidebar.innerHTML=""
    Object.assign(sidebar.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
        }

    )
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
            gap: "2rem"
        })
          const video = document.createElement("div");
        video.style.width="100%";
        video.id="imageDiv";
        sidebar.appendChild(video)

       runCamera()
    } else {

        Object.assign(listslist.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            height: "100%",
            width: "100%",
            margin: 0,
            paddingTop: "3rem",
            gap: "2rem"
        })
    }
    const icon3 = document.createElement("img");
    icon3.src = "images/MostPopular.png";
    icon3.onclick = () => {
        document.getElementById("MostPopularList").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });
    }
    icon3.style.width = "100%"
    listslist.appendChild(icon3);

    const icon4 = document.createElement("img");
    icon4.src = "images/MostPopularISBN.png";
    icon4.onclick = () => {
        document.getElementById("MostPopularISBNList").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });
    }
    icon4.style.width = "100%"
    listslist.appendChild(icon4);
    const icon1 = document.createElement("img");
    icon1.src = "images/HighestRated.png";
    icon1.onclick = () => {
        document.getElementById("HighestRatedList").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });
    }
    icon1.style.width = "100%"
    listslist.appendChild(icon1);

    const icon2 = document.createElement("img");
    icon2.src = "images/HighestRatedISBN.png";
    icon2.onclick = () => {
        document.getElementById("HighestRatedISBNList").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start"
        });
    }
    icon2.style.width = "100%"
    listslist.appendChild(icon2);



    sidebar.appendChild(listslist)
}

async function ReloadMain(libName, isServer) {
    main.innerHTML = "";
    const library = await getLibrary(libName);
    console.log(library)
    const bookLists = document.createElement("div");
    Object.assign(bookLists.style, {
        width: "calc(100% - 2rem)",
        height: "calc(100% - 2rem)",
        overflow: "auto",
        padding: "1rem",
        flexDirection: "column",
        gap: "5rem"
    })

    //most popular books
    const MostPopular = document.createElement("div");
    MostPopular.id = "MostPopularList"
    Object.assign(MostPopular.style, {
        width: "calc(100% - 4rem)",

        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "center",
        justifyContent: "center"
    })
    MostPopular.innerHTML =  `<div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of the most popular books in ${libName}</h1></div>`
    for (const book of library.mostPopular)

        MostPopular.appendChild(Book((isServer ? "40vw" : "47.5vw"), library.books.find((b) => b.id == book.id), libName))


    //most popular isbn books
    const MostPopularISBN = document.createElement("div");
    MostPopularISBN.id = "MostPopularISBNList"
    Object.assign(MostPopularISBN.style, {
        width: "calc(100% - 4rem)",

        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "center",
        justifyContent: "center"
    }) 
    MostPopularISBN.innerHTML=`<div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
">List of the most popular ISBN books in ${libName}</h1></div>`
    for (const book of library.mostPopularISBN)

        MostPopularISBN.appendChild(Book((isServer ? "40vw" : "47.5vw"), library.books.find((b) => b.id == book), libName))


    //highest rated books
    const HighestRated = document.createElement("div");
    HighestRated.id = "HighestRatedList"
    Object.assign(HighestRated.style, {
        width: "calc(100% - 4rem)",

        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "center",
        justifyContent: "center"
    })
    HighestRated.innerHTML = ` <div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of the highest rated books in ${libName}</h1></div>`
    for (const book of library.highestRatedBooks||[])

        HighestRated.appendChild(Book((isServer ? "40vw" : "47.5vw"), library.books.find((b) => b.id == book), libName))

    //highest rated isbn books
    const HighestRatedISBN = document.createElement("div");
    HighestRatedISBN.id = "HighestRatedISBNList"
    Object.assign(HighestRatedISBN.style, {
        width: "calc(100% - 4rem)",

        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "center",
        justifyContent: "center"
    })
    HighestRatedISBN.innerHTML = ` <div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of the highest rated ISBN books in ${libName}</h1></div>`
    for (const book of library.highestRatedBooksISBN)

             HighestRatedISBN.appendChild(Book((isServer ? "40vw" : "47.5vw"), library.books.find((b) => b.id == book), libName))


    //all books
    const AllBooks = document.createElement("div");
    AllBooks.id = "allBooksList"
    Object.assign(AllBooks.style, {
        width: "calc(100% - 4rem)",

        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "center",
        justifyContent: "center"
    })
    AllBooks.innerHTML = `<div style="width:100%;display:flex; justify-content:center;"><h1 style="
display: inline-block;
  font-family: 'Montserrat', sans-serif;
  background: white;
  border: 0.2rem solid rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
"> List of all books in ${libName}</h1></div>`
    for (const book of library.books)

        AllBooks.appendChild(Book((isServer ? "40vw" : "47.5vw"), book, libName))

    bookLists.appendChild(MostPopular)
    bookLists.appendChild(MostPopularISBN)
    bookLists.appendChild(HighestRated)
    bookLists.appendChild(HighestRatedISBN)
    bookLists.appendChild(AllBooks)
    main.appendChild(bookLists)

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
        justifyContent: "space-between", // vertical spacing
        alignItems: "center", // centers horizontally
        backgroundColor: "white"
    });


    const img = document.createElement("img");

    img.src = GithubLink + libName + "/" + contents.id + "/cover.jpg"

    Object.assign(img.style, {
        maxHeight: "50%",
        maxWidth: "80%",
        marginTop: "1rem"
    })
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

<h1 style="color:${contents.availible==true?"green":"red"};font-size:1rem;margin:0">${contents.availible==true?"Availible":"Unavailible"}</h2>
<p style="margin:0.3rem;font-size:0.8rem;">Authors:${contents.authors}</p>
<p style="margin:0;font-size:0.8rem;">Genre:${contents.genres}</p>
`
    Object.assign(metadata.style, {
        height: "45%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center" // centers horizontally
    })
    base.appendChild(metadata)



    let ghost;
    let descBase;
    let histbase;
    base.onclick = async () => {
        //check whether this book is already in the middle, if position is absolute, its currently in the middle
        if (base.style.position != "absolute") showBook()
        else hideBook();

    }

    async function showBook() {
        const bookData = await getBook(libName, contents.id);
        const histories = bookData.history
        console.log(bookData)
        ghost = document.createElement("div");
        base.replaceWith(ghost);
        main.appendChild(base)
        base.style.position = "absolute";
        Object.assign(ghost.style, {
            width: "calc(" + base.style.width + " + " + base.style.padding + " + " + base.style.padding + ")",
            height: "calc(" + base.style.height + " + " + base.style.padding + " + " + base.style.padding + ")"
        })

        ghost.parentElement.parentElement.style.pointerEvents = "none"
        ghost.parentElement.parentElement.style.transition = `opacity ${500}ms ease`
        ghost.parentElement.parentElement.style.opacity = "0";


        base.style.opacity = "1";
        base.style.zIndex = (3 + histories.length).toString();
        base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`

        base.style.left = ghost.offsetLeft + "px";
        base.style.top = ghost.offsetTop-ghost.parentElement.parentElement.scrollTop + "px";
        requestAnimationFrame(() => {
            base.style.left = `calc(${pageCenter} - 7.5rem)`
            base.style.top = `10rem`
        })

        base.style.pointerEvents = "none"
        await sleep(1000);


        descBase = document.createElement("div");

        descBase.style.cssText = base.style.cssText;
        descBase.style.zIndex = "2"
        main.appendChild(descBase)
        base.style.left = `calc(${pageCenter} - 25rem)`
        descBase.onclick = async () => {
            hideBook();

        }
        await sleep(1000);
        base.style.transition = ``
        descBase.style.transition = ``



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
            top: "calc(" + base.style.top + " + 20rem)"

        })

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
                pointerEvents: "none"
            });

            currentBase.addEventListener("mouseenter", () => {
                currentBase.style.zIndex = (2 + histories.length).toString();
                currentBase.style.transition = "transform 0.3s ease"
                currentBase.style.transform = "scale(1.5)"; // grow by 10%
            });

            currentBase.addEventListener("mouseleave", () => {
                currentBase.style.zIndex = (2).toString();
                currentBase.style.transform = "scale(1)"; // back to normal
            });


            histbase.appendChild(currentBase)
            const video = document.createElement("video");
            video.src = GithubLink + libName + "/" + contents.id + "/videos/" + history.start + ".mp4";
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
            video.style.maxWidth = "95%"
            currentBase.appendChild(video)
            const borrowedTime = new Date(history.start) // example timestamp
            const returnedTime = new Date(history.end); // can be null

            // readable dates
            const borrowedStr = borrowedTime.toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            const returnedStr = returnedTime ?
                returnedTime.toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }) :
                "Not returned yet";

            // time difference (in ms)
            const diff = (returnedTime ? returnedTime - borrowedTime : Date.now() - borrowedTime);
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
                left: histbase.children[i].offsetLeft
            }
        }

        for (i = 0; i < histories.length; i++) {
            histbase.children[i].style.top = "-20rem"
            histbase.children[i].style.left = "calc(" + histbase.offsetWidth / 2 + "px - 7.5rem)"
            histbase.children[i].style.opacity = "1";
            histbase.children[i].style.zIndex = (2 + histories.length - i).toString();

            histbase.children[i].style.position = "absolute";
            histbase.children[i].style.transition = `left ${1000}ms ease, top ${1000}ms ease`
        }

        for (i = 0; i < histories.length; i++) {
            histbase.children[i].style.top = histories[i].pos.top + "px";
            histbase.children[i].style.left = histories[i].pos.left + "px";
            await sleep(1000 / histories.length)
        }
        await sleep(1000 - 1000 / histories.length);
        for (i = 0; i < histories.length; i++) {
            histbase.children[i].style.position = "";
            histbase.children[i].style.pointerEvents = ""
        }
        base.style.pointerEvents = ""
        descBase.style.pointerEvents = ""

    }

    async function hideBook() {
        base.style.pointerEvents = "none"
        descBase.style.pointerEvents = "none"
        for (const history of histbase.children) {

            history.style.pointerEvents = "none"

            history.style.top = history.offsetTop + "px";
            history.style.left = history.offsetLeft + "px";




        }
        for (const history of histbase.children) {
            history.style.transition = `left ${1000}ms ease, top ${1000}ms ease`
            history.style.position = "absolute"
            if (Math.random() > 0.5) {
                history.style.left = "-15rem"
            } else {
                history.style.left = "100vw"
            }
        }
        await sleep(1000);
        for (const history of histbase.children) {
            history.style.transition = ""
            history.style.top = "-55rem"
            history.style.left = descBase.style.left;

        }
        for (i = 0; i < histbase.children.length; i++) {
            requestAnimationFrame(() => {
                histbase.children[i].style.transition = `left ${1000}ms ease, top ${1000}ms ease`
                histbase.children[i].style.top = "-20rem"
                histbase.children[i].style.zIndex = (3 + i).toString()
            })

            await sleep(1000 / histbase.children.length);
        }
        await sleep(1000 - 1000 / histbase.children.length);
        base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`
        base.style.left = "calc(" + pageCenter + " - " + "7.5rem)"

        await sleep(1000)
        histbase.remove();
        histbase = "";
        descBase.remove();
        descBase = ""
        console.log(ghost.offsetLeft)
        base.style.top = ghost.offsetTop-ghost.parentElement.parentElement.scrollTop + "px";
        base.style.left = ghost.offsetLeft + "px";
        await sleep(500)
        ghost.parentElement.parentElement.style.opacity = "1"
        await sleep(500);
        base.style.position = ""
        ghost.replaceWith(base);
        ghost.remove();
        ghost = ""
        base.parentElement.parentElement.style.pointerEvents = ""
        base.style.pointerEvents = ""
        base.style.zIndex = ""
    }

    return base
}
const sleep = ms => new Promise(r => setTimeout(r, ms));