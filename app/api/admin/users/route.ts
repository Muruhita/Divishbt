import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterRole = searchParams.get("role") || "low";
    
    // Загружаем роли
    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    
    const reqLevel = rolesMap.get(requesterRole) || 0;

    // Загружаем всех юзеров
    const result = await db.execute("SELECT id, username, account_name, role, plain_password, avatar FROM users");
    
    // Фильтруем по иерархии
    const filtered = result.rows.filter(u => {
      const userLevel = rolesMap.get(u.role as string) || 0;
      return userLevel <= reqLevel; 
    });

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("ОШИБКА ЗАГРУЗКИ СПИСКА ЮЗЕРОВ:", error);
    return NextResponse.json({ error: error.message || "Ошибка получения списка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const requesterRole = searchParams.get("requesterRole");

    if (!id || !requesterRole) return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    
    const reqLevel = rolesMap.get(requesterRole) || 0;

    const targetRes = await db.execute({ sql: "SELECT role FROM users WHERE id = ?", args: [id] });
    if (targetRes.rows.length === 0) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    const targetLevel = rolesMap.get(targetRes.rows[0].role as string) || 0;

    if (reqLevel <= targetLevel) return NextResponse.json({ error: "Недостаточно прав для удаления" }, { status: 403 });

    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ОШИБКА УДАЛЕНИЯ ЮЗЕРА:", error);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}
