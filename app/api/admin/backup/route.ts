import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tavern_token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'owner') return NextResponse.json({ error: "Только Овнер может делать бэкап" }, { status: 403 });

  const tables = ['users', 'archive', 'roles', 'categories', 'logs', 'favorites', 'info_pages'];
  const backup: Record<string, any> = {};

  try {
    for (const table of tables) {
      const res = await db.execute(`SELECT * FROM ${table}`);
      backup[table] = res.rows;
    }
    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка при создании бэкапа: " + error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('tavern_token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'owner') return NextResponse.json({ error: "Только Овнер может восстанавливать бэкап" }, { status: 403 });

  try {
    const backup = await req.json();
    const tables = ['users', 'archive', 'roles', 'categories', 'logs', 'favorites', 'info_pages'];

    // Формируем пакет запросов для транзакции
    const statements: any[] = [];

    for (const table of tables) {
      // 1. Очищаем текущую таблицу
      statements.push({ sql: `DELETE FROM ${table}`, args: [] });

      // 2. Вставляем данные из бэкапа
      if (backup[table] && Array.isArray(backup[table])) {
        for (const row of backup[table]) {
          const keys = Object.keys(row);
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map(k => row[k]);
          
          statements.push({
            sql: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
            args: values
          });
        }
      }
    }

    // Выполняем всё разом
    await db.batch(statements, "write");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка восстановления: " + error.message }, { status: 500 });
  }
}
