import fs from "node:fs";import { template_update, get_slides, write_slides, get_course_name } from "./utils";

const slide_name = process.argv[2];
const course_name = get_course_name();

console.log("--- Update slides list ---");
const current_slides = get_slides();
current_slides.slides = current_slides.slides.filter(
  (slide) => slide.name !== slide_name
);
write_slides(current_slides);

console.log("--- Remove folders ---");
fs.rmSync(`./${course_name}/${slide_name}`, { recursive: true, force: true });
fs.rmSync(`./slides/${slide_name}`, { recursive: true, force: true });

console.log("--- Update index.html ---");
template_update();
