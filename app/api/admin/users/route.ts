import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const requester = token ? await verifyToken(token) : null;

    if (!requester) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    
    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const reqLevel = rolesMap.get(requester.role) || 0;

    // Убран plain_password
    const result = await db.execute("SELECT id, username, account_name, role, avatar FROM users");
    
    const filtered = result.rows.filter(u => {
      if (u.role === 'owner' && requester.role !== 'owner') return false;
      const userLevel = rolesMap.get(u.role as string) || 0;
      return userLevel <= reqLevel; 
    });

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const requester = token ? await verifyToken(token) : null;

    if (!requester) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const reqLevel = rolesMap.get(requester.role) || 0;

    const targetRes = await db.execute({ sql: "SELECT role FROM users WHERE id = ?", args: [id] });
    if (targetRes.rows.length === 0) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    const targetRole = targetRes.rows[0].role as string;
    if (targetRole === 'owner') return NextResponse.json({ error: "Нельзя удалить Овнера" }, { status: 403 });

    const targetLevel = rolesMap.get(targetRole) || 0;
    if (reqLevel <= targetLevel) return NextResponse.json({ error: "Недостаточно прав для удаления" }, { status: 403 });

    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}
