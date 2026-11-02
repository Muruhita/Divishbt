import { createClient } from "@libsql/client";

// Читаем переменные окружения из настроек Vercel
const url = process.env.tavernodb_TURSO_DATABASE_URL;
const authToken = process.env.tavernodb_TURSO_AUTH_TOKEN;

// Выводим диагностику в консоль сервера (видно в Vercel -> Logs)
console.log("==================================================");
console.log("🔍 ДИАГНОСТИКА БАЗЫ ДАННЫХ (lib/db.ts)");
console.log("URL базы:", url ? "✅ Загружен" : "❌ НЕ НАЙДЕН (undefined)");
console.log("Токен:", authToken ? "✅ Загружен" : "❌ НЕ НАЙДЕН (undefined)");
if (url) {
  // Печатаем только начало ссылки, чтобы не спамить полным токеном
  console.log("Префикс URL:", url.substring(0, 20) + "...");
}
console.log("==================================================");

if (!url || !authToken) {
  console.warn("⚠️ ВНИМАНИЕ: Переменные окружения не найдены. База данных не будет работать. Проверьте настройки Environment Variables в Vercel.");
}

// Создаем клиент. 
// Если переменных нет, используем "заглушки", чтобы сборка (Build) не падала с ошибкой.
// Ошибка вылезет только в момент реального запроса к БД.
export const db = createClient({
  url: url || "libsql://dummy-url-to-prevent-build-crash.turso.io",
  authToken: authToken || "dummy-token",
});
