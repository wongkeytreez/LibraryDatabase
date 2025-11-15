const GithubLink =
  "https://api.github.com/repos/wongkeytreez/LibraryDatabase/contents/";
const GithubToken =
  "xxxx";

async function uploadFile(path, base64Data, branch = "main") {
  const apiUrl = GithubLink + path;
  const headers = {
    Authorization: `token ${GithubToken}`,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };

  async function getSha() {
    const res = await fetch(`${apiUrl}?ref=${branch}&t=${Date.now()}`, {
      headers,
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    return json.sha;
  }

  async function put(sha) {
    const body = {
      message: `Upload ${path}`,
      content: base64Data,
      branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${json.message}`);
    console.log(`✅ Uploaded ${path} (${branch})`);
    return json;
  }

  // ---- main upload logic ----
  let sha = await getSha();

  try {
    return await put(sha);
  } catch (err) {
    if (
      err.message.includes("sha does not match") ||
      err.message.includes("out of date")
    ) {
      console.warn("⚠️ SHA outdated — refetching and retrying...");
      sha = await getSha();
      return await put(sha);
    }
    throw err;
  }
}

async function getFile(path) {

  const res = await fetch(GithubLink + path, {
    headers: {
      Authorization: `token ${GithubToken}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const data = await res.json(); // or res.arrayBuffer() for binary files

  return data;
}
async function deleteFile(path) {
  const apiUrl = `${GithubLink}${path}`;
  const headers = {
    Authorization: `token ${GithubToken}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) throw new Error(`❌ File not found: ${path}`);
  const { sha } = await res.json();

  const body = {
    message: `Delete ${path}`,
    sha,
    branch: "main",
  };

  const delRes = await fetch(apiUrl, {
    method: "DELETE",
    headers,
    body: JSON.stringify(body),
  });

  const json = await delRes.json();
  if (!delRes.ok) throw new Error(`${delRes.status} ${json.message}`);
  console.log(`🗑️ Deleted ${path}`);
  return json;
}

async function deleteFolder(folder) {
  const headers = {
    Authorization: `token ${GithubToken}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${GithubLink}${folder}`, { headers });
  if (!res.ok) throw new Error(`❌ Folder not found: ${folder}`);
  const files = await res.json();

  for (const file of files) {
    if (file.type === "dir") {
      // recursively delete subfolder
      await deleteFolder(file.path);
    } else if (file.type === "file") {
      await deleteFile(file.path);
    }
  }
  console.log(`📂 Folder removed: ${folder}`);
}

module.exports = { uploadFile, getFile, deleteFile, deleteFolder };
