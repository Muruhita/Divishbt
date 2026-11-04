import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password, account_name, role, requesterRole, requesterName } = await req.json();

    // 1. Получаем карту ролей и их уровней
    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    
    const reqLevel = rolesMap.get(requesterRole) || 0;
    const newLevel = rolesMap.get(role) || 0;

    // 2. ИЕРАРХИЯ: Нельзя создавать аккаунты выше или равные себе (кроме Овнера)
    if (requesterRole !== 'owner' && reqLevel <= newLevel) {
      return NextResponse.json({ error: "Недостаточно прав для создания этого ранга" }, { status: 403 });
    }

    // 3. ЗАЩИТА ОВНЕРА: Роль 'owner' может создать только 'owner'. И она должна быть одна.
    if (role === 'owner') {
      if (requesterRole !== 'owner') {
        return NextResponse.json({ error: "Только Овнер может создавать Овнера" }, { status: 403 });
      }
      const ownerCount = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'owner'");
      if (Number(ownerCount.rows[0].count) >= 1) {
        return NextResponse.json({ error: "Овнер уже существует. Нельзя создать второго." }, { status: 400 });
      }
    }

    // 4. ЛИМИТЫ НА РОЛИ
    const roleCounts = await db.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    const countsMap = new Map(roleCounts.rows.map(r => [r.role, Number(r.count)]));

    if (role === 'creator' && (countsMap.get('creator') || 0) >= 5) {
      return NextResponse.json({ error: "Лимит Создателей (5) исчерпан" }, { status: 400 });
    }
    if (role === 'guardian' && (countsMap.get('guardian') || 0) >= 10) {
      return NextResponse.json({ error: "Лимит Хранителей (10) исчерпан" }, { status: 400 });
    }

    // 5. АНТИ-СПАМ (50 запросов за 20 минут)
    const timeLimit = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const spamCheck = await db.execute({
      sql: "SELECT COUNT(*) as count FROM logs WHERE action = 'СОЗДАНИЕ_АККАУНТА' AND user_name = ? AND timestamp > ?",
      args: [requesterName, timeLimit]
    });
    if (Number(spamCheck.rows[0].count) >= 50) {
      return NextResponse.json({ error: "Слишком много запросов. Подождите 20 минут." }, { status: 429 });
    }

    // 6. Хеширование и сохранение
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.execute({
      sql: "INSERT INTO users (username, password, plain_password, account_name, role) VALUES (?, ?, ?, ?, ?)",
      args: [username, hashedPassword, password, account_name, role],
    });

    // Логируем создание для анти-спама и истории
    await db.execute({
      sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
      args: ["СОЗДАНИЕ_АККАУНТА", account_name, requesterName, requesterRole],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ОШИБКА ПРИ СОЗДАНИИ ЮЗЕРА:", error);
    return NextResponse.json({ error: error.message || "Ошибка базы данных" }, { status: 400 });
  }
}
