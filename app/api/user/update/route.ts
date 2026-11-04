import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, oldPassword, newPassword, avatar } = await req.json();

    const userRes = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [userId] });
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    // Если меняем пароль
    if (newPassword) {
      const isValid = await bcrypt.compare(oldPassword, user.password as string);
      if (!isValid) return NextResponse.json({ error: "Старый пароль неверен" }, { status: 400 });

      const hashed = await bcrypt.hash(newPassword, 10);
      await db.execute({
        sql: "UPDATE users SET password = ?, plain_password = ? WHERE id = ?",
        args: [hashed, newPassword, userId]
      });
    }

    // Если меняем аватарку
    if (avatar !== undefined) {
      await db.execute({
        sql: "UPDATE users SET avatar = ? WHERE id = ?",
        args: [avatar, userId]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении профиля" }, { status: 500 });
  }
}
