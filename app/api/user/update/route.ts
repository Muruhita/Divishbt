import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, oldPassword, newPassword, avatar, newUsername, newAccountName } = await req.json();
    
    const userRes = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [userId] });
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    // 1. Смена логина
    if (newUsername && newUsername !== user.username) {
      const checkRes = await db.execute({ sql: "SELECT id FROM users WHERE username = ?", args: [newUsername] });
      if (checkRes.rows.length > 0) return NextResponse.json({ error: "Этот логин уже занят" }, { status: 400 });
      await db.execute({ sql: "UPDATE users SET username = ? WHERE id = ?", args: [newUsername, userId] });
    }

    // 2. Смена имени (никнейма)
    if (newAccountName && newAccountName !== user.account_name) {
      await db.execute({ sql: "UPDATE users SET account_name = ? WHERE id = ?", args: [newAccountName, userId] });
    }

    // 3. Смена пароля
    if (newPassword) {
      const isValid = await bcrypt.compare(oldPassword, user.password as string);
      if (!isValid) return NextResponse.json({ error: "Старый пароль неверен" }, { status: 400 });
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.execute({ sql: "UPDATE users SET password = ?, plain_password = ? WHERE id = ?", args: [hashed, newPassword, userId] });
    }

    // 4. Смена аватарки
    if (avatar !== undefined) {
      await db.execute({ sql: "UPDATE users SET avatar = ? WHERE id = ?", args: [avatar, userId] });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при обновлении профиля" }, { status: 500 });
  }
}
