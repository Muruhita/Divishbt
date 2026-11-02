import { createClient } from "@libsql/client";

// ИСПРАВЛЕНО: добавлена буква 'y' в tavernoydb
const url = process.env.tavernoydb_TURSO_DATABASE_URL;
const authToken = process.env.tavernoydb_TURSO_AUTH_TOKEN;

console.log("==================================================");
console.log("🔍 ДИАГНОСТИКА БАЗЫ ДАННЫХ (lib/db.ts)");
console.log("URL базы:", url ? "✅ Загружен" : "❌ НЕ НАЙДЕН (undefined)");
console.log("Токен:", authToken ? "✅ Загружен" : "❌ НЕ НАЙДЕН (undefined)");
console.log("==================================================");

if (!url || !authToken) {
  throw new Error("Переменные окружения не найдены. Проверьте названия в Vercel!");
}

export const db = createClient({
  url: url,
  authToken: authToken,
});
