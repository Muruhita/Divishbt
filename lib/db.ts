import { createClient } from "@libsql/client";

// Подключаемся к базе, используя переменные из вашего скриншота Vercel
export const db = createClient({
  url: process.env.tavernodb_TURSO_DATABASE_URL as string,
  authToken: process.env.tavernodb_TURSO_AUTH_TOKEN as string,
});