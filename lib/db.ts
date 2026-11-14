import { createClient } from "@libsql/client";

const url = process.env.tavernoydb_TURSO_DATABASE_URL;
const authToken = process.env.tavernoydb_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("⚠️ ВНИМАНИЕ: Переменные окружения Turso (tavernoydb_TURSO_DATABASE_URL / tavernoydb_TURSO_AUTH_TOKEN) не найдены!");
}

export const db = createClient({
  url: url || "",
  authToken: authToken || "",
});
