import fs from "node:fs";
import { Config, copyFile, createIfNotExist, Slides } from "./utils";

export const config_file = "./sliman.json";
const default_slides: Slides = { slides: [] };

const course_name = process.argv[2];

const config: Config = {
  course_name: course_name,
};

console.log("--- Create config file ---");
fs.writeFileSync(config_file, JSON.stringify(config, null, 2));

console.log("--- Create course folders ---");
createIfNotExist(`./${course_name}`);
createIfNotExist(`./slides`);
createIfNotExist("./.github");
createIfNotExist("./.github/workflows");
copyFile("./template", `./${course_name}`, "index.html");

console.log("--- Create slides list ---");
fs.writeFileSync(
  `./${course_name}/slides.json`,
  JSON.stringify(default_slides, null, 2)
);

console.log("--- Create github workflows ---");
const syaml = fs.readFileSync("./template/static.yml", "utf8");
const lines = syaml.split("\n");
lines[39] = `          path: './${course_name}'`;
fs.writeFileSync("./.github/workflows/static.yml", lines.join("\n"));