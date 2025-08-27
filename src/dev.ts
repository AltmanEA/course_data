import { exec, spawn } from "child_process";

const slide_name = process.argv[2];
const slide_dir = `./slides/${slide_name}`;
const cmd = "cd " + slide_dir + " && pnpm dev";
spawn(cmd, { shell: true, stdio: "inherit" });
const cmd_open ="code " + slide_dir + "/slides.md";
exec(cmd_open);

