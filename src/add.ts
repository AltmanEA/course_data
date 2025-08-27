import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { copyFile, createIfNotExist, get_slides, write_slides } from "./utils";

const slide_name = process.argv[2];

const slide_dir = `./slides/${slide_name}`;

console.log("--- Check slides list ---")
const current_slides = get_slides();
for (const slide of current_slides.slides) {
  if (slide.name === slide_name) {
    console.log("Slide already exists");
    process.exit(1);  
  }
}
current_slides.slides.push({ name: slide_name, title:  slide_name} );
write_slides(current_slides);

console.log("--- Create folder and package.json ---")
createIfNotExist(slide_dir);
createIfNotExist(slide_dir + `/public`);
createIfNotExist(slide_dir + `/components`);
const package_file = fs.readFileSync("./template/package.json", "utf8");
const package_json  = JSON.parse(package_file);
package_json.name = slide_name;
const newPackageJson = JSON.stringify(package_json, null, 2);
fs.writeFileSync(slide_dir + `/package.json`, newPackageJson);

console.log("--- Install dependencies ---");
const cmd = "cd " + slide_dir + " && pnpm install";
const child = spawnSync(cmd, { shell: true, stdio: "inherit" });
console.log(`--- Dependencies installed with code ${child.status} ---`);

console.log("--- Copy components ---");
copyFile("./template", slide_dir + `/components`, "Courser.vue");
copyFile("./template", slide_dir, "global-top.vue");
copyFile("./template", slide_dir, "slides.md");

console.log("--- Done ---");


