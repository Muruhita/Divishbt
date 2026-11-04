import { createClient } from "@libsql/client";

const url = process.env.tavernoydb_TURSO_DATABASE_URL || process.env.tavernodb_TURSO_DATABASE_URL;
const authToken = process.env.tavernoydb_TURSO_AUTH_TOKEN || process.env.tavernodb_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn("⚠️ ВНИМАНИЕ: Переменные окружения Turso не найдены.");
}

export const db = createClient({
  url: url || "libsql://dummy-url.turso.io",
  authToken: authToken || "dummy-token",
});
