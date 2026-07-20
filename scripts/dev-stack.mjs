/**
 * Starts Express API (:3001) + Vite (:8080) together.
 * Uploads require POST /api/assets/upload → Express (Stage 10A).
 */
import { spawn } from "node:child_process";
import process from "node:process";

const children = [];

const run = (npmScript) => {
  const child = spawn("npm", ["run", npmScript], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    for (const other of children) {
      if (other !== child && !other.killed) other.kill(signal || "SIGTERM");
    }
    process.exit(code ?? 1);
  });
};

run("dev:api");
run("dev:vite");

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
