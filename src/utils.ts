import { load } from "cheerio";
import fs from "node:fs";
import pretty from "pretty";

export type Config = { course_name: string };
export type Slide = { name: string; title: string };
export type Slides = { slides: Slide[] };

export function createIfNotExist(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

export function copyFile(folder_from: string, folder_to: string, file: string) {
  fs.copyFileSync(folder_from + "/" + file, folder_to + "/" + file);
}

export function template_update() {
  const course_name = get_course_name();
  const index_html = fs.readFileSync(`./${course_name}/index.html`, "utf8");
  const $ = load(index_html);
  const $slides = $("#slide_list");  
  const slides = get_slides();

  $slides.empty();
  $slides.append("<ul></ul>");
  const $ul = $slides.find("ul");

  for (const slide of slides.slides) {
    const $li = $("<li><a href='./" + slide.name + "'>" + slide.title + "</a></li>");
    $ul.append($li);
  }

  fs.writeFileSync(`./${course_name}/index.html`, pretty($.html()));
}

export function get_config(): Config {
  const config_file = "./sliman.json";
  try {
    const config_json = fs.readFileSync(config_file, "utf8");
    return JSON.parse(config_json);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: unknown) {
    console.log("Config file not found, init project first.");
    process.exit(1);
  }
}

export function get_course_name(): string {
  const config = get_config();
  return config.course_name;
}

export function get_slides(): Slides {
  const config = get_config();
  const course_name = config.course_name;
  try {
    const slides_json = fs.readFileSync(`./${course_name}/slides.json`, "utf8");
    return JSON.parse(slides_json);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: unknown) {
    console.log("Slides list not found, init project first.");
    process.exit(1);
  }
}

export function write_slides(slides: Slides) {
  const config = get_config();
  const course_name = config.course_name;
  fs.writeFileSync(
    `./${course_name}/slides.json`,
    JSON.stringify(slides, null, 2)
  );
}

