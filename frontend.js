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
    const cameradiv=document.createElement("div");
    cameradiv.id="imageDiv"
    sidebar.appendChild(cameradiv);
    runCamera();
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
    for(const book of library.books){
        const container = document.createElement("div");
container.style.display = "flex";
container.style.flexDirection = "column";
container.style.alignItems = "center";      
container.style.justifyContent = "center"; 
container.style.cursor="pointer";
container.style.position="relative";
  container.style.margin = "12px";
  container.style.width = "200px";
  container.style.height= "300px"
  container.style.padding = "24px";
  container.style.borderRadius = "10px";
  container.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
  container.style.background = "white";
container.style.zIndex='2';
  const cover = document.createElement("img");
  cover.src=book.bookUrl+"/cover.jpg";
  cover.style.maxHeight="40%";
  cover.style.maxWidth="80%";
        container.appendChild(cover);
    
        const details = document.createElement("div");
        details.innerHTML=`<h1>${book.title}</h1>`+
        `<p>genres:${book.genres}</p>`;
        container.appendChild(details);

    container.addEventListener("click",()=>{
 const flexGap = 12;
centerChild(container, 1000, flexGap);
booksContainer.style.left = "0px";
booksContainer.style.top = "0px";
transitionTo(booksContainer,0,-400,1000)
setTimeout(() => {
  const history = [{}, {}, {},{}, {}, {},{}, {}, {},{}, {}, {},{}, {}, {}];
  const historyDiv = document.createElement("div");



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
}, 800 + history.length * staggerDelay);

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

  // Ghost to keep layout
  const ghost = document.createElement("div");
  Object.assign(ghost.style, {
    width: `${childRect.width}px`,
    height: `${childRect.height}px`,
    margin: getComputedStyle(child).margin,
  });
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




function reverseCenter(child, ghost, duration = 1000) {
  const parentRect = child.parentElement.getBoundingClientRect();
  const ghostRect = ghost.getBoundingClientRect();

  const targetX = ghostRect.left - parentRect.left;
  const targetY = ghostRect.top - parentRect.top;

  transitionTo(child, targetX, targetY, duration);

  setTimeout(() => {
    ghost.replaceWith(child);
    Object.assign(child.style, {
      position: "",
      left: "",
      top: "",
      width: "",
      height: "",
      transition: "",
    });
  }, duration);
}





