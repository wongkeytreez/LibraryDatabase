async function RequestCookie(LibName,libPassword){
    const res = await fetch(ServerAdress + "/RequestCookie", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ LibName, libPassword })
});
const data = await res.json();
console.log(data)
return data
}
async function getLibrary(libName) {
  const response = await fetch(GithubLink + libName + "/data.json");
  if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
  return await response.json();
}

async function getBook(libName, bookID) {
  const response = await fetch(GithubLink + libName + `/${bookID}/data.json`);
  if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
  return await response.json();
}

async function AddBook(title,id,genres,desc,cover) {
const form =  new FormData();
form.append("photo", cover); // File or Blob
form.append("data", JSON.stringify({title,id,genres,desc}));
   const res = await fetch(ServerAdress + "/AddBook", {
  method: "POST",
  credentials:"include",
  headers: { "Content-Type": "application/json" },
  body:form
});
const data = await res.json();
console.log(data)
}
async function Borrow(photos,bookID) {
const form =  new FormData();

for (const photo of photos) {
  form.append("photos", photo); // name "files" must match multer field name
}
form.append("data", JSON.stringify({bookID}));
   
const res = await fetch(ServerAdress + "/Borrow", {
  method: "POST",
  credentials:"include",
  headers: { "Content-Type": "application/json" },
  body:form
});

const data = await res.json();
console.log(data)
}
async function Return(bookID) {

   
const res = await fetch(ServerAdress + "/Return", {
  method: "POST",
  credentials:"include",
  headers: { "Content-Type": "application/json" },
  body:JSON.stringify({bookID})
});

const data = await res.json();
console.log(data)
}