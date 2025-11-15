const args = process.argv.slice(2);
import * as fs from "fs";

import { uploadFile, deleteFolder } from "./github.js";

function getArg(flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith("--")) {
    return args[index + 1];
  }
  return true; // flag exists but has no value (like --password)
}

if (getArg("--type") == "addlib") {
  const name = getArg("--name");
  const password = getArg("--password");
  const libs = JSON.parse(fs.readFileSync("./libs.json"));
  if (libs.find((lib) => lib.name == name)) {
    console.error("lib alr exists");
    process.exit();
  }
  uploadFile(name + "/data.json", btoa(JSON.stringify({ books: [] })));
  libs.push({
    name: name,
    password: password,
    Settings: {
      ReturnBookRequiresPassword: false,
      BorrowBookRequiresPassword: false,
      EditBookRequiresPassword: true,
      RemoveBookRequiresPassword: true,
      AddBookRequiresPassword: true,
    },
  });
  fs.writeFileSync("./libs.json", JSON.stringify(libs));
} else if (getArg("--type") == "remlib") {
  const name = getArg("--name");
  const libs = JSON.parse(fs.readFileSync("./libs.json"));
  if (!libs.find((lib) => (lib.name = name))) {
    console.error("lib doesnt exists");
    process.exit();
  }
  await deleteFolder(name);

  fs.writeFileSync(
    "./libs.json",
    JSON.stringify(libs.filter((lib) => lib.name !== name)),
  );
}
