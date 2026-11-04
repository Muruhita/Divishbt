import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password, account_name, role, requesterRole } = await req.json();

    // Загружаем роли для проверки иерархии
    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    
    const reqLevel = rolesMap.get(requesterRole) || 0;
    const newLevel = rolesMap.get(role) || 0;

    if (reqLevel <= newLevel) {
      return NextResponse.json({ error: "Недостаточно прав для создания этого ранга" }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Пытаемся добавить
    await db.execute({
      sql: "INSERT INTO users (username, password, plain_password, account_name, role) VALUES (?, ?, ?, ?, ?)",
      args: [username, hashedPassword, password, account_name, role],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА ПРИ СОЗДАНИИ ЮЗЕРА:", error);
    // Возвращаем реальную ошибку базы данных
    return NextResponse.json({ error: error.message || "Ошибка базы данных" }, { status: 400 });
  }
}
