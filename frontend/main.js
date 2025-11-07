async function Start3(isServer) {
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
        sidebar.style.height = "100%";
        sidebar.style.backgroundColor = "grey"
        setUpSidebar();
    }
    ReloadMain(libName)
}

function setUpSidebar() {

}

async function ReloadMain(libName, isServer) {
    main.innerHTML = "";
    const library = await getLibrary(libName);
    console.log(library)
    const bookLists = document.createElement("div");
    Object.assign(bookLists.style, {
        width: "100%",
        height: "100%",
        overflow: "auto",
        paddingTop: "10rem",
        flexDirection: "column",
        gap: "5rem"
    })

    //all books

    const AllBooks = document.createElement("div");
    Object.assign(AllBooks.style, {
        width: "calc(100% - 4rem)",

        padding: "2rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "3rem",
        alignItems: "center",
        justifyContent: "center"
    })
    for (const book of library.books) {

        AllBooks.appendChild(Book((isServer ? "60vw" : "50vw"), book, libName))
    }

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
        base.style.top = ghost.offsetTop + "px";
        requestAnimationFrame(() => {
            base.style.left = `calc(${pageCenter} - ${(Number(base.style.width.split("rem")[0])/2+Number(base.style.padding.split("rem")[0]))}rem)`
            base.style.top = `10rem`
        })

        base.style.pointerEvents = "none"
        await sleep(1000);


        descBase = document.createElement("div");

        descBase.style.cssText = base.style.cssText;
        descBase.style.zIndex = "2"
        main.appendChild(descBase)
        base.style.left = `calc(${pageCenter} - ${Number(base.style.width.split("rem")[0])*2}rem)`
        descBase.onclick = async () => {
            hideBook();

        }
        await sleep(1000);
        base.style.transition = ``
        descBase.style.transition = ``



        histbase = document.createElement("div");
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
        main.appendChild(histbase);
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
                video.currentTime = history.thumbnailFrame||0;
                video.pause();
            });

            video.addEventListener("mouseenter", () => video.play());

            video.addEventListener("mouseleave", () => {
                video.pause();
                video.currentTime = history.thumbnailFrame||0;
            });
            video.style.maxHeight = "75%";
            video.style.maxWidth = "95%"
            currentBase.appendChild(video)
            const borrowedTime = new Date(history.start )// example timestamp
const returnedTime =new Date(history.end); // can be null

// readable dates
const borrowedStr = borrowedTime.toLocaleString("en-US", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
const returnedStr = returnedTime
  ? returnedTime.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  : "Not returned yet";

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
            
               history.style.pointerEvents="none"
          
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
        base.style.top = ghost.offsetTop + "px";
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