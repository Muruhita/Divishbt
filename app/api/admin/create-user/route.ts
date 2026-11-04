import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password, account_name, role, requesterRole } = await req.json();

    let reqLevel = 0;
    let newLevel = 0;

    // Пытаемся получить уровни из БД. Если таблицы нет - используем стандартные.
    try {
      const rolesRes = await db.execute("SELECT id, level FROM roles");
      const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
      reqLevel = rolesMap.get(requesterRole) || 0;
      newLevel = rolesMap.get(role) || 0;
    } catch (e) {
      console.warn("Таблица roles не найдена, используем дефолтные значения");
      const defaultLevels: Record<string, number> = { owner: 4, creator: 3, guardian: 2, high: 1, low: 0 };
      reqLevel = defaultLevels[requesterRole] || 0;
      newLevel = defaultLevels[role] || 0;
    }

    if (reqLevel <= newLevel) {
      return NextResponse.json({ error: "Недостаточно прав для создания этого ранга" }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.execute({
      sql: "INSERT INTO users (username, password, plain_password, account_name, role) VALUES (?, ?, ?, ?, ?)",
      args: [username, hashedPassword, password, account_name, role],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ОШИБКА ПРИ СОЗДАНИИ ЮЗЕРА:", error);
    return NextResponse.json({ error: error.message || "Ошибка базы данных" }, { status: 400 });
  }
}
