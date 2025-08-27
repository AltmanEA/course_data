import fs from "node:fs";
import { get_slides } from "./utils";

const current_slides = get_slides();

for (const slide of current_slides.slides) {
    console.log("--- Remove dist folder for " + slide.name + " ---");
    fs.rmSync(`./slides/${slide.name}/dist`, { recursive: true, force: true });
}