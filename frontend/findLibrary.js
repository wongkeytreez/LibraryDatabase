function Start2(isServer, error) {
  main.innerHTML = "";
  main.style.pointerEvents = "";
  const center = document.createElement("div");

  Object.assign(center.style, {
    width: "30rem",
    aspectRatio: "16 / 9",
    boxShadow: "0 1rem 2.5rem rgba(0, 0, 0, 0.25)", // deeper + softer
    borderRadius: "1rem",
    background: "white", // helps contrast
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  });

  center.innerHTML = `
<img src="images/logo.png" style="max-width:50%">
<h2>connecting as a: ${isServer ? "library" : "client"}</h2>
${error ? "<p style=color:red>" + error + "</p>" : ``}
<div style="width:80%">
<h3 style="font-size:0.8rem;margin-bottom:0.3rem">Library name</h3>
<input style="width:calc(100% - 0.5rem);padding:0.5rem;border-radius:0.5rem;font-size:0.8rem;border-width: thin;" id="libName" placeholder="Name">
</div>
${
  isServer
    ? `
<div style="width:80%">
<h3 style="font-size:0.8rem;margin-bottom:0.3rem">Library Password</h3>
<input style="width:calc(100% - 0.5rem);padding:0.5rem;border-radius:0.5rem;font-size:0.8rem;border-width: thin;" id="libPassword" placeholder="Name">
</div>
`
    : ""
}
<button style="width:40%;padding:0.5rem;margin:1rem;border-radius:0.5rem;font-size:0.8rem;border-width: thin;" onclick="Start3(${isServer})">confirm</button>
<p style="font-size:0.8rem">Dont have a library yet? You can request a library <a href="https://forms.gle/ZksPSaXnGgM5HmB46" target="_blank">here!</a></p>
<p style="font-size:0.8rem">Need help? Visit our <a href="https://github.com/wongkeytreez/LibraryDatabase" target="_blank">github</a> for more info!</p>
`;

  main.appendChild(center);
}
