import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function start(label, folder) {
  const child = spawn(npmCommand, ["run", "dev", "--prefix", folder], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${label} stopped (${signal}).`);
    } else if (code && code !== 0) {
      console.error(`${label} exited with code ${code}.`);
      stopAll(code);
    }
  });

  return child;
}

const children = [
  start("frontend", "frontend"),
  start("backend", "backend"),
];

let stopping = false;
function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }

  setTimeout(() => process.exit(exitCode), 100);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
