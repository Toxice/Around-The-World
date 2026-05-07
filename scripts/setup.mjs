import { execSync } from "child_process";

console.log("Running database migrations...");
execSync("npx prisma migrate deploy", { stdio: "inherit" });

console.log("Seeding students...");
execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });

console.log("Done! Run `npm run dev` to start the app.");
