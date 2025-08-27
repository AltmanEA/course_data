import { spawnSync } from "child_process";
import { get_course_name } from "./utils";

const course_name = get_course_name();

const cmd = `http-server -o ./${course_name} -c-1`;
spawnSync(cmd, { shell: true, stdio: "inherit" });
