import { createClient } from "@libsql/client";

const url = process.env.tavernodb_TURSO_DATABASE_URL;
const authToken = process.env.tavernodb_TURSO_AUTH_TOKEN;

// Если переменных нет, выбрасываем понятную ошибку
if (!url || !authToken) {
  console.warn("⚠️ ВНИМАНИЕ: Переменные окружения Turso не найдены. Проверьте настройки Vercel.");
}

export const db = createClient({
  url: url || "libsql://dummy-url-to-prevent-crash.turso.io",
  authToken: authToken || "dummy-token",
});
