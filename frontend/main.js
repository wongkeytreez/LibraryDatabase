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
    const bookLists=document.createElement("div");
    Object.assign(bookLists.style,{
        width:"100%",
        height:"100%",
        overflow:"auto",paddingTop:"10rem",flexDirection:"column",gap:"5rem"
    })

    //all books
   
     const AllBooks=document.createElement("div");
    Object.assign(AllBooks.style,{
        width:"calc(100% - 4rem)",

        padding:"2rem",
        display:"flex",
  flexWrap:"wrap",gap:"3rem",
    alignItems:"center",justifyContent:"center"
    })
    for(const book of library.books){
    
        AllBooks.appendChild(Book((isServer?"60vw":"50vw"),book,libName))
    }

    bookLists.appendChild(AllBooks)
    main.appendChild(bookLists)
    
}

function Book(pageCenter,contents,libName) {
       
    const base = document.createElement("div");
    Object.assign(base.style, {
        width: "11rem",
        height: "16rem",
          boxShadow: "0 1rem 2.5rem rgba(0, 0, 0, 0.25)", // deeper + softer
        borderRadius: "1rem",
        padding:"2rem",
        display:"flex",flexDirection:"column",
  gap:"auto",
    justifyContent:"center"
        
    })

    const img= document.createElement("img");
    img.src = GithubLink+libName+"/"+contents.id+"/cover.jpg"
    Object.assign(img.style, {maxHeight:"60%"})
base.appendChild(img);
    
const metadata = document.createElement("div");
metadata.innerHTML=`
<h2>${contents.title}</h2>
`
base.appendChild(metadata)



    let ghost;
    base.onclick = () => {
        //check whether this book is already in the middle, if position is absolute, its currently in the middle
        if (base.style.position != "absolute") {
            ghost = document.createElement("div");
            base.replaceWith(ghost);
            main.appendChild(base)
            base.style.position = "absolute";
            Object.assign(ghost.style, {
                width: "calc("+base.style.width +" + "+base.style.padding+" + "+base.style.padding+")",
                height:"calc("+ base.style.height +" + "+base.style.padding+" + "+base.style.padding+")"
            })
            for(const parent of base.parentElement.parentElement.children)
                for(const child of parent.children){
            child.style.transition = `opacity ${500}ms ease`
            child.style.opacity="0";

            }
            base.style.opacity="1";
            base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`
            
            base.style.left = ghost.offsetLeft+"px";
            base.style.top = ghost.offsetTop+"px";
            requestAnimationFrame(() => {
                base.style.left = `calc(${pageCenter} - ${Number(base.style.width.split("rem")[0])/2}rem)`
            base.style.top = `20rem`
            })

            base.style.pointerEvents = "none"
            setTimeout(() => {
                base.style.transition = "";
                base.style.pointerEvents = ""
            }, 1000);

        } else {
            base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`
            
            base.style.left = base.offsetLeft+"px";
            base.style.top = base.offsetTop+"px";
            requestAnimationFrame(() => {
                base.style.left = ghost.offsetLeft+"px"
            base.style.top = ghost.offsetTop+"px"
            })
            base.style.pointerEvents = "none"
             setTimeout(() => {
                for(const parent of base.parentElement.parentElement.children)
                for(const child of parent.children){
            child.style.transition = `opacity ${500}ms ease`
            child.style.opacity="1";

            }
             base.style.transition = `left ${1000}ms ease, top ${1000}ms ease`
            }, 500);
            setTimeout(() => {
                base.style.transition = "";
                base.style.position = "";
                ghost.replaceWith(base)
                ghost.remove();
                ghost = null;
                base.style.pointerEvents = ""
            }, 1000);
        }

    }


    return base
}