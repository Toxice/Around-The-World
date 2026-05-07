import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  migrate: {
    async adapter() {
      const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
      const url = process.env.DATABASE_URL ?? "file:./dev.db";
      return new PrismaBetterSqlite3({ url });
    },
  },
});
