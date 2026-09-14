import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
const args = [
  "node_modules/firebase-tools/lib/bin/firebase.js",
  "emulators:start",
  "--project",
  "demo-construction",
  "--export-on-exit=/data/export",
];
if (existsSync("/data/export/firebase-export-metadata.json"))
  args.push("--import=/data/export");
// Sin npm/npx intermedios: tini entrega SIGTERM a este proceso y la CLI
// recibe un único SIGINT para exportar Auth y Firestore antes de salir.
const child = spawn(process.execPath, args, { stdio: "inherit" });
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    if (!stopping) {
      stopping = true;
      child.kill("SIGINT");
    }
  });
child.on("error", () => process.exit(1));
child.on("exit", (code) => process.exit(code ?? 1));
