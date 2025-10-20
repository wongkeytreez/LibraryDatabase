const ServerAdress="https://a64357fd-0177-4658-a24c-6a4c2a7a6efa-00-2uwgh2sq3kxhv.riker.replit.dev"
const GithubLink = "https://raw.githubusercontent.com/wongkeytreez/LibraryDatabase/main/";
let IsServer=null;

let fps=null;
let ImagesPerVideo=null;
const ImagesList=[];
async function borrowBook(bookID){
    Borrow(await imageDataListToBlobs(ImagesList),bookID);
}
async function runCamera(){
    await initCamera();
setInterval(async () => {

    ImagesList.push( captureFrame());
    
    if((ImagesList.length>Math.ceil(ImagesPerVideo/2))&&window.BorrowData==null){ImagesList.splice(0,ImagesList.length-Math.ceil(ImagesPerVideo/2));}

    showImage(ImagesList[ImagesList.length-1],document.getElementById("imageDiv"))

    
    
}, 1000/fps)
}