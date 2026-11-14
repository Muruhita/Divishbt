import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any[] = [];

  // 1. Проверка переменных окружения
  const envChecks = [
    { name: "JWT_SECRET", value: process.env.JWT_SECRET },
    { name: "Turso Database URL", value: process.env.tavernoydb_TURSO_DATABASE_URL },
    { name: "Turso Auth Token", value: process.env.tavernoydb_TURSO_AUTH_TOKEN },
  ];

  envChecks.forEach(env => {
    results.push({
      category: "Окружение",
      name: env.name,
      status: env.value ? "ok" : "warning",
      message: env.value ? "Установлена" : "Переменная не найдена",
    });
  });

  // 2. Проверка подключения к БД и задержки
  try {
    const start = Date.now();
    
    const queryPromise = db.execute("SELECT 1");
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Превышено время ожидания (5 сек)")), 5000)
    );

    await Promise.race([queryPromise, timeoutPromise]);

    results.push({
      category: "База данных",
      name: "Подключение к Turso",
      status: "ok",
      latency: Date.now() - start,
      message: "Соединение установлено",
    });

    // 3. Проверка наличия всех таблиц
    const expectedTables = ['users', 'archive', 'roles', 'categories', 'logs', 'favorites', 'info_pages', 'login_attempts'];
    const tablesRes = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTables = tablesRes.rows.map(r => r.name as string);

    expectedTables.forEach(table => {
      const exists = existingTables.includes(table);
      results.push({
        category: "Таблицы БД",
        name: `Таблица "${table}"`,
        status: exists ? "ok" : "error",
        message: exists ? "Существует" : "НЕ НАЙДЕНА!",
      });
    });

  } catch (error: any) {
    results.push({
      category: "База данных",
      name: "Подключение к Turso",
      status: "error",
      message: error.message || "Неизвестная ошибка",
    });
  }

  const hasErrors = results.some(r => r.status === "error");
  const hasWarnings = results.some(r => r.status === "warning");

  return NextResponse.json({
    overallStatus: hasErrors ? "error" : hasWarnings ? "warning" : "ok",
    details: results,
    timestamp: new Date().toISOString()
  });
}
