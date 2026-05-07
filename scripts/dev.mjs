import { execSync, spawn } from "child_process";

console.log("Running database migrations...");
execSync("npx prisma migrate deploy", { stdio: "inherit" });

console.log("Starting dev server...");
const dev = spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true });
dev.on("exit", (code) => process.exit(code ?? 0));
