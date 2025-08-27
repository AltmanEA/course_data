import { load } from "cheerio";import { spawnSync } from "child_process";
import fs from "node:fs";
import {
  createIfNotExist,
  get_course_name,
  get_slides,
  template_update,
  write_slides,
} from "./utils";

const slide_name = process.argv[2];
const slide_dir = `./slides/${slide_name}`;
const course_name = get_course_name();
const slide_base = `/${course_name}/${slide_name}/`;

console.log("--- Build ---");
const cmd = "cd " + slide_dir + " && pnpm build --base " + slide_base;
const child = spawnSync(cmd, { shell: true, stdio: "inherit" });
if (child.status !== 0) {
  process.exit(1);
}

console.log("--- Copy files ---");
createIfNotExist(`./${course_name}/${slide_name}`);
fs.cpSync(
  slide_dir + `/dist`, 
  `./${course_name}/${slide_name}`, 
  { recursive: true, }
);

console.log("--- Update slides list ---");
const current_slides = get_slides();
for (const slide of current_slides.slides) {
  if (slide.name === slide_name) {
    slide.title = getTitleByLink(`./${course_name}/${slide_name}/index.html`);
  }
}
write_slides(current_slides);

console.log("--- Update index.html ---");
template_update();

console.log("--- Clean up ---");
// fs.rmSync(slide_dir + `/dist`, { recursive: true, force: true });

function getTitleByLink(link: string) {
  const fileContent = fs.readFileSync(link, "utf8");
  const $ = load(fileContent);
  const title = $("title").text();
  return title.replace(/ - Slidev$/, "");
}
