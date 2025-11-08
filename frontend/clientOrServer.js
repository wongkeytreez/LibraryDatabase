const main = document.getElementById("Main");
const sidebar = document.getElementById("sidebar");
Object.assign(main.style,{
    display:"flex",
    flexDirection:"column",
    flexWrap:"wrap",
    justifyContent:"center",
    alignItems:"center",
    padding:"1%",
    width:"100%",
    height:"100%",
    overflow: "auto",
   position : "relative",backgroundImage:"url(images/background.jpeg)",
})

function Start1(){
    //is the client mobile or desktop
const ua = navigator.userAgent.toLowerCase();
const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
if (isMobile) {
 return Start2(false);
}

const center = document.createElement("div");

Object.assign(center.style, {
  width: "30rem",
  aspectRatio: "16 / 9",
  boxShadow: "0 1rem 2.5rem rgba(0, 0, 0, 0.25)", // deeper + softer
  borderRadius: "1rem",
  background: "white", // helps contrast
  padding:"2rem",
      display:"flex",
  flexDirection:"column",
    alignItems:"center",
});

center.innerHTML=`
<h1>MICROLIBS</h1>
<p style="font-size:1.2rem;margin:0.5rem;">connect as a:</p>
<button style="width:80%;padding:0.5rem;margin:0.5rem;border-radius:0.5rem;font-size:1rem;border-width: thin;" onclick="Start2(false)">Client</button>
<button style="width:80%;padding:0.5rem;margin:0.5rem;border-radius:0.5rem;font-size:1rem;border-width: thin;" onclick="Start2(true)">Library</button>
<p style="font-size:0.8rem">Dont have a library yet? You can request a library <a href="#https://forms.gle/ZksPSaXnGgM5HmB46" target="_blank">here!</a></p>
<p style="font-size:0.8rem">Need help? Visit our <a href="https://github.com/wongkeytreez/LibraryDatabase" target="_blank">github</a> for more info!</p>
`





main.appendChild(center);
}
