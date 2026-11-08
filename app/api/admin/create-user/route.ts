import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const requester = token ? await verifyToken(token) : null;

    if (!requester) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { username, password, account_name, role } = await req.json();

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    
    const reqLevel = rolesMap.get(requester.role) || 0;
    const newLevel = rolesMap.get(role) || 0;

    // ЖЕСТКАЯ ПРОВЕРКА: Создавать аккаунты может только Хранитель (2), Создатель (3) и Овнер (4)
    if (requester.role !== 'owner' && reqLevel < 2) {
      return NextResponse.json({ error: "Недостаточно прав для создания аккаунтов" }, { status: 403 });
    }

    // Проверка на то, что нельзя создать ранг выше или равный своему
    if (requester.role !== 'owner' && reqLevel <= newLevel) {
      return NextResponse.json({ error: "Недостаточно прав для создания этого ранга" }, { status: 403 });
    }

    if (role === 'owner') {
      if (requester.role !== 'owner') {
        return NextResponse.json({ error: "Только Овнер может создавать Овнера" }, { status: 403 });
      }
      const ownerCount = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'owner'");
      if (Number(ownerCount.rows[0].count) >= 1) {
        return NextResponse.json({ error: "Овнер уже существует." }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.execute({
      sql: "INSERT INTO users (username, password, account_name, role) VALUES (?, ?, ?, ?)",
      args: [username, hashedPassword, account_name, role],
    });

    await db.execute({
      sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
      args: ["СОЗДАНИЕ_АККАУНТА", account_name, requester.account_name, requester.role],
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ошибка базы данных";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
