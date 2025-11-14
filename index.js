const ServerAdress =
  "https://a64357fd-0177-4658-a24c-6a4c2a7a6efa-00-2uwgh2sq3kxhv.riker.replit.dev";
const GithubLink =
  "https://raw.githubusercontent.com/wongkeytreez/LibraryDatabase/main/";
let isserver = null;
let libname = null;

let fps = null;
let ImagesPerVideo = null;

const ImagesList = [];
async function borrowBook(bookID, password = "") {
  await sleep((1000 / fps) * Math.floor(ImagesPerVideo / 2));
  Borrow(await imageDataListToBlobs(ImagesList), bookID, password);
}

async function runCamera() {
  await initCamera();
  setInterval(async () => {
    ImagesList.push(captureFrame());

    ImagesList.splice(0, ImagesList.length - ImagesPerVideo);

    showImage(
      ImagesList[ImagesList.length - 1],
      document.getElementById("imageDiv")
    );
  }, 1000 / fps);
}
setInterval(async () => {
  ReloadMain();
  if (isserver) updateCookie();
}, 60000 * 5);

Start1();
