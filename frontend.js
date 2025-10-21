// Basic page setup
document.documentElement.style.height = "100%";
const main = document.getElementById("Main");

// Start screen
function Start1() {
main.style.margin = "0";
main.style.height = "100vh"; 
main.style.width = "100%";
main.style.display = "flex";
main.style.justifyContent = "center";
main.style.alignItems = "center";
main.style.background = "#f0f2f5";
main.style.fontFamily = "Segoe UI, Roboto, Arial, sans-serif";
main.style.overflowY="auto"
main.style.overflowX = "hidden"; 
main.style.position = "relative";

main.innerHTML="";

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
  clientBtn.addEventListener("click", () => { IsServer = false; Start2(); });
  container.appendChild(clientBtn);

  const serverBtn = document.createElement("button");
  serverBtn.textContent = "Server";
  serverBtn.style.width = "100%";
  serverBtn.style.padding = "14px";
  serverBtn.style.fontSize = "18px";
  serverBtn.style.cursor = "pointer";
  serverBtn.addEventListener("click", () => { IsServer = true; Start2(); });
  container.appendChild(serverBtn);

  main.appendChild(container);
}
Start1()

// Library form
function Start2() {
  main.innerHTML = "";

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
  if (IsServer) {
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

  main.appendChild(container);
}
async function Start3(LibName,libPassword){
    if(IsServer){
      const data= await RequestCookie(LibName,libPassword);

      if(data.error!=null) return Start2();
     
      fps=data.fps
      ImagesPerVideo=data.ImagesPerVideo;
      main.style.width="80%";
    const sidebar = document.getElementById("sidebar");
    sidebar.style.width="20%";
    sidebar.style.height="100%";
        sidebar.style.display = "flex";
sidebar.style.flexDirection = "column";
sidebar.style.padding = "20px";
sidebar.style.alignItems = "center";      
sidebar.style.justifyContent = "center"; 
    const cameradiv=document.createElement("div");
    cameradiv.id="imageDiv"
    cameradiv.style.position="absolute";
    cameradiv.style.top="0"
        cameradiv.style.left="0"
    sidebar.appendChild(cameradiv);
    runCamera();

const group = createButtonGroup();
const details = document.createElement("div");
group.addButton("Add Book",(btn) => {
   [...btn.parentElement.children].forEach(b => (b.style.opacity = 0.5));
        btn.style.opacity = 1;
  details.innerHTML="";
  
  const titleInput = document.createElement("input");
  titleInput.placeholder="input title here";

  const idInput = document.createElement("input");
  idInput.placeholder="input id here";

  const imgPopup = document.createElement("div");
  imgPopup.style.width="100%";
  imgPopup.style.height="100%";
  imgPopup.style.backgroundColor="grey";
  imgPopup.style.opacity="0.8";
  imgPopup.style.zIndex="100"
  imgPopup.style.position="absolute"
  imgPopup.style.top="100vh";

   document.body.appendChild(imgPopup)
  transitionTo(imgPopup,0,0,1500);
  setTimeout(() => {
  const popup = document.createElement("div");
  popup.style.width="20%";
  popup.style.height="20%";
  popup.style.backgroundColor="white";

  popup.style.zIndex="102"
  popup.style.position="absolute"
  popup.style.top="100vh";
  popup.style.display="flex";
  popup.style.flexDirection="column";
  popup.style.justifyContent="center";
  popup.style.alignItems="center"
  popup.style.borderRadius="12px"


    popup.style.transition = `top ${500}ms ease, translate ${500}ms ease`;
  requestAnimationFrame(() => {
    popup.style.top = `50vh`;
    popup. style.left="50vw"
    popup.style.translate="-50% -50%"
  });
   document.body.appendChild(popup)
document.body.appendChild(imgPopup)

   const imgDiv = document.createElement("div");
   document.getElementById("imageDiv").id="oldimageDiv"
   imgDiv.id="imageDiv";
   imgDiv.style.height="80%"
   const group = createButtonGroup();
   group.addButton("Take picture",(btn)=>{
    if( btn.textContent=="Take picture"){
   imgDiv.id="frozen";
   btn.textContent="Retake picture"
   group.container.children[1].style.opacity="1"
    }
    else{
      imgDiv.id="imageDiv";
   btn.textContent="Take picture"
    group.container.children[1].style.opacity="0.5"
    }
   })
   group.addButton("submit",()=>{

   })
   group.addButton("upload picture",()=>{
group.container.children[1].style.opacity="0.5"

   const filePicker = document.createElement("input");
   filePicker.type="file";
   filePicker.accept="image/*";
   filePicker.style.display="none";
    filePicker.onchange=async()=>{
      group.container.children[0].textContent="Take picture"
      group.container.children[0].click();
        const img = new Image();
     img.src = URL.createObjectURL( filePicker.files[0]);
  await img.decode(); // wait until it's loaded

  const canvas = document.getElementById("frozen").children[0];
canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
    }
   filePicker.click();
   })
   
  
   popup.appendChild(imgDiv)
   popup.appendChild(group.container)
   
  }, 1000);
   
}
);
group.addButton("Add Book(ISBN)",(btn)=>{
   [...btn.parentElement.children].forEach(b => (b.style.opacity = 0.5));
        btn.style.opacity = 1;
  
details.innerHTML="";

  details.className = "details";
  details.style.display = "flex"; details.style.flexDirection = "column";
  details.style.gap = "6px";
  details.style.marginTop = "8px";
details.style.alignItems = "center";

  const input = document.createElement("input");
  input.placeholder = "Enter ISBN";

  const search = document.createElement("button");
  search.textContent = "Search";

  // inactivity timeout
  let timer;
  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      input.value=""
    }, 5000);
  }

  input.addEventListener("keydown", resetTimer);
  resetTimer();

  search.onclick = async() => {
    details.innerHTML="";
      details.append(input, search);
    clearTimeout(timer);
   const data =await GetISBNBook(input.value);
   if(data== null)return resetTimer();

   const img = document.createElement("img");
   img.src=data.cover;
   img.style.height="40%";

   details.appendChild(img);
    console.log(data)
   const infoDiv= document.createElement("div")
  infoDiv.innerHTML=`
  <div style="display:flex;flex-direction:column"><h3>Title</h3><p>${data.title}</p></div>
  <div style="display:flex;flex-direction:column"><h3>Authors</h3><p>${data.authors}</p></div>
  <div style="display:flex;flex-direction:column"><h3>Genres</h3><p>${data.genres}</p></div>
  `;
  infoDiv.style.display = "flex"; infoDiv.style.flexDirection = "row";
  infoDiv.style.alignItems = "center";  infoDiv.style.gap = "12px";
  
  details.appendChild(infoDiv);
   
  const submit = document.createElement("button");
  submit.textContent = "Confirm";
    details.appendChild(submit);
    submit.onclick=()=>{
   
     AddBook(data.title,input.value,data.genres,data.desc,data.cover)
    }
  };


  details.append(input, search);
  sidebar.appendChild(details);
});
group.addButton("Borrow Book", (btn)=>{
  [...btn.parentElement.children].forEach(b => (b.style.opacity = 0.5));
        btn.style.opacity = 1;
details.innerHTML="";

  details.className = "details";
  details.style.display = "flex"; details.style.flexDirection = "column";
  details.style.gap = "6px";
  details.style.marginTop = "8px";

  const input = document.createElement("input");
  input.placeholder = "Enter book id/ISBN";

  const submit = document.createElement("button");
  submit.textContent = "Submit";

  // inactivity timeout
  let timer;
  function resetTimer() {
   
    clearTimeout(timer);
    timer = setTimeout(() => {
      input.value=""
    }, 5000);
  }

  input.addEventListener("keydown", resetTimer);
  resetTimer();

  submit.onclick = async () => {
   try{ if(await getBook(LibName,input.value))
   StartBorrow(input.value);
   }catch(e){ input.placeholder="book not found!",input.value=""}
  };

  details.append(input, submit);
  sidebar.appendChild(details);
});
sidebar.appendChild(group.container)
sidebar.appendChild(details);
    }
    const library=await getLibrary(LibName);
    if(library==null)Start2();
    main.innerHTML="";
    main.style.flexDirection="column";
    const booksContainer = document.createElement("div")
    booksContainer.style.display = "flex";
booksContainer.style.flexDirection = "row";
booksContainer.style.width = "100%";
booksContainer.style.height = "100%";
booksContainer.style.alignItems = "center";      
booksContainer.style.justifyContent = "center"; 
booksContainer.style.zIndex="2";
booksContainer.style.position="relative";
let currentShownBook=null
    for(const book of library.books){
        const container = document.createElement("div");
container.style.display = "flex";
container.style.flexDirection = "column";
container.style.alignItems = "center";      
container.style.justifyContent = "space-between"; 
container.style.cursor="pointer";
container.style.position="relative";
  container.style.margin = "12px";
  container.style.width = "200px";
  container.style.height= "350px"
  container.style.padding = "24px";
  container.style.borderRadius = "10px";
  container.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
  container.style.background = "white";
container.style.zIndex='2';
  const cover = document.createElement("img");
  cover.src=book.bookUrl+"/cover.jpg";
  cover.style.maxHeight="60%";
  cover.style.maxWidth="95%";
        container.appendChild(cover);
    
        const details = document.createElement("div");
        details.style.display = "flex";
details.style.flexDirection = "column";
details.style.alignItems = "center";      
details.style.justifyContent = "space-evenly";
        details.innerHTML=`<h2 style="margin:0;font-size:30px;">${book.title}</h2>`+
        `
         <p style="margin:0;ont-size:25px;font-weight: bold;color: ${(book.history&&book.history[book.history.length-1].end==null)?"red":"green"};">${(book.history&&book.history[book.history.length-1].end==null)?"Unavailible":"Availible"}</p>
        <p style="margin:0;font-size:12px;">genres:${(book.genres.length>0)?book.genres.toString():" not added yet!"}</p>
        <p style="margin:0;font-size:12px;">authors:${(book.authors&&book.authors.length>0)?book.authors.toString():" not added yet!"}</p>
       
        `;
        details.style.height="40%"
        container.appendChild(details);
let historyDiv = document.createElement("div");
let ghost=null;
const flexGap = 12;
    container.addEventListener("click", ()=>{
 let bookData;
   getBook(LibName,book.id).then((data)=>{bookData=data;},(err)=>{console.error(err)});
 console.log(bookData)
      if(currentShownBook==container){
       container.style.pointerEvents="none";
        for(let child of historyDiv.children){
          child.style.transition=`opacity ${1000}ms ease`
          child.style.opacity=0;
      }

     main.children[2].style.zIndex="1";
     main.children[1].style.zIndex="1";
     transitionTo(main.children[2], (parseFloat(getComputedStyle(container).left)+parseFloat(getComputedStyle(container).width)/2) +flexGap, (container.getBoundingClientRect().top )-flexGap ,1000)
     
const el = main.children[2].children[0];
el.style.transition = "box-shadow 1000ms ease";

requestAnimationFrame(() => {
  el.style.boxShadow = "0 6px 20px rgba(0,0,0,0)";
});

     setTimeout(() => {
        main.children[2].remove();
        
        transitionTo(booksContainer,0,0,1000)
        reverseCenter(container,ghost,flexGap,1000)
historyDiv.remove();
historyDiv=document.createElement("div");
           setTimeout(() => {
              for(let sib of booksContainer.children){
                if(sib==container)continue;
          sib.style.transition=`opacity ${500}ms ease`
          sib.style.opacity=1;
      }
      setTimeout(() => {
        container.style.pointerEvents="";
        for(let sib of booksContainer.children)sib.style.pointerEvents="";
      }, 500);
           }, 500);
      }, 1000);
   currentShownBook=null;
        return;
        
      }
      currentShownBook=container;
 
ghost=centerChild(container, 1000, flexGap);
booksContainer.style.left = "0px";
booksContainer.style.top = "0px";
transitionTo(booksContainer,0,-400,1000)
container.style.pointerEvents="none";
setTimeout(() => {
  const history =bookData.history;
  



// 3. Set child styles
Object.assign(historyDiv.style, {
  position: "absolute",
  top: (container.getBoundingClientRect().top +container.getBoundingClientRect().height*1.3)-flexGap + "px",
  left: (parseFloat(getComputedStyle(main).width) / 2) -flexGap+ "px",
  transform: "translateX(-50%)",
  width: parseFloat(getComputedStyle(container.parentElement).width) + "px",
  pointerEvents: "none", // container not interactive
  zIndex: "10",
  display: "flex",
  flexDirection: "row",
  gap: flexGap + "px",
  justifyContent: "center",
  alignItems: "flex-start",
  flexWrap: "wrap",
  zIndex:1
});

main.appendChild(historyDiv);

for (let i = 0; i < history.length; i++) {
  const historyCard = document.createElement("div");
  Object.assign(historyCard.style, {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: "12px",
    width: "200px",
    height: "300px",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    background: "white",
    flex: "0 0 auto",       // allows growing/shrinking
    pointerEvents: "auto",  // so cards are clickable
    zIndex:1
  });
  historyDiv.appendChild(historyCard);
}

const originalPos=[];
  // Store original positions
const staggerDelay = 50; // ms between each card

for (let i = 0; i < history.length; i++) {
  const card = historyDiv.children[i];
  originalPos.push({
    startX: card.offsetLeft,
    startY: card.offsetTop,
  });
}
for (let i = 0; i < history.length; i++) {
  const card = historyDiv.children[i];
  
  // Set starting absolute positions
  card.style.position = "absolute";
  card.style.left = `${-parseFloat(getComputedStyle(container).width)/2 + parseFloat(getComputedStyle(historyDiv).width)/2}px`;
  card.style.top = `${-parseFloat(getComputedStyle(container).height)*1.3}px`;
  
  // Animate with stagger
  setTimeout(() => {
    transitionTo(card, originalPos[i].startX - flexGap, originalPos[i].startY - flexGap, 800);
  }, i * staggerDelay);
}

// Restore normal flow after last animation finishes
setTimeout(() => {
  for (let i = 0; i < history.length; i++) {
    historyDiv.children[i].style.position = "";
  }
  container.style.pointerEvents="";
    container.style.zIndex="3";
}, 800 + history.length * staggerDelay);

//description
const desccont = document.createElement("div");
Object.assign(desccont.style, {
  position: "absolute",
  top: (container.getBoundingClientRect().top  -flexGap)+ "px",
  left:((parseFloat(getComputedStyle(container).left)+parseFloat(getComputedStyle(container).width)/2) +flexGap)+ "px",
  transform: "translateX(-50%)",
  width:200 + "px",

  zIndex: "10",
  display: "flex",
  flexDirection: "row",
  gap: flexGap + "px",
  justifyContent: "center",
  alignItems: "flex-start",
  flexWrap: "wrap",
  zIndex:1
});

const descCard = document.createElement("div");
Object.assign(descCard.style, {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  margin: "12px",
  width: "100%",
  height: "350px",
  padding: "24px",
  borderRadius: "10px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  background: "white",
  flex: "0 0 auto",

  zIndex: 1,
  gap: "10px",
});

descCard.innerHTML = `
  <b style="font-size: 22px;">Synopsis</b>
  <p id="synopsis" style="
    font-size: 16px;
    color: #333;
    margin: 0;
    overflow-y: auto;
    max-height: 100%;
    flex: 1;
    pointer-events:auto;
    white-space: pre-wrap;
  "></p>
`;

const p = descCard.querySelector("#synopsis");
const text = bookData.synopsis || "The synopsis hasn't been added yet.";
let i = 0;

function typeWriter() {
  if (i < text.length) {
    p.textContent += text.charAt(i);
    i++;
    setTimeout(typeWriter, Math.random()*10+5); // adjust speed (ms per letter)
  }
}
setTimeout(typeWriter, 800)



  desccont.appendChild(descCard);
  main.appendChild(desccont);
  transitionTo(desccont,(parseFloat(getComputedStyle(main).width) / 2) +parseFloat(getComputedStyle(container).width)*1.05,(container.getBoundingClientRect().top-flexGap ),1000)
  setTimeout(() => {
    desccont.style.zIndex="4";
  }, 1000);
}, 1000);

  
    })
booksContainer.appendChild(container);
    }
    main.appendChild(booksContainer)
}

function transitionTo(el, x, y, duration = 1000) {
  el.style.transition = `left ${duration}ms ease, top ${duration}ms ease`;
  requestAnimationFrame(() => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
}

function centerChild(child, duration = 1000, flexGap = 12) {
  const parent = child.parentElement;
  const siblings = [...parent.children].filter(el => el !== child);
  parent.style.position ||= "relative";

  // Get child position relative to parent
  const parentRect = parent.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  const startX = childRect.left - parentRect.left-flexGap;
  const startY = childRect.top - parentRect.top-flexGap;
console.log(childRect,parentRect)  

  // Ghost to keep layout
  const ghost = document.createElement("div");
  Object.assign(ghost.style, {
    width: `${childRect.width}px`,
    height: `${childRect.height}px`,
    margin: getComputedStyle(child).margin,
    top: childRect.top+"px",
    left: childRect.left+"px",
  });
  console.log(childRect.top)
  parent.insertBefore(ghost, child);

  // Absolute positioning without jump
  Object.assign(child.style, {
    position: "absolute",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${childRect.width}px`,
    height: `${childRect.height}px`,
    boxSizing: "border-box",
    transition: "none",
  });

  // Fade siblings
  siblings.forEach(sib => {
    sib.style.transition = `opacity ${duration / 2}ms ease`;
    sib.style.opacity = 0;
    sib.style.pointerEvents = "none";
  });

  void child.offsetWidth; // force reflow

  const targetX = (parentRect.width - childRect.width) / 2 - flexGap;
  const targetY = (parentRect.height - childRect.height) / 2 - flexGap;

  transitionTo(child, targetX, targetY, duration);

  return ghost;
}




function reverseCenter(child, ghost,flexGap, duration = 1000) {



  const targetX = parseFloat(getComputedStyle(ghost).left) -flexGap;
  const targetY = parseFloat(getComputedStyle(ghost).top) -flexGap ;

  transitionTo(child, targetX, targetY, duration);

  setTimeout(() => {
    ghost.replaceWith(child);
    Object.assign(child.style, {
      position: "",

      transition: "",
    });

  }, duration);
}





function createButtonGroup() {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.gap = "8px";

  const buttons = [];

  return {
    addButton(label, callback) {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.style.opacity = 1;
      btn.style.transition = "opacity 0.2s";
      btn.style.cursor = "pointer";

      btn.onclick = () => {
    
       if(callback)callback(btn);
      };

      container.appendChild(btn);
      buttons.push(btn);


    },container
  };
}
