import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const now = Date.now();
    const windowMs = 60000; // 1 минута

    // Очищаем старые попытки
    await db.execute({ sql: "DELETE FROM login_attempts WHERE timestamp < ?", args: [now - windowMs] });

    // Проверяем блокировку
    const attemptsRes = await db.execute({ sql: "SELECT COUNT(*) as count FROM login_attempts WHERE ip = ?", args: [ip] });
    if (Number(attemptsRes.rows[0].count) >= 5) {
      return NextResponse.json({ error: "Слишком много попыток. Подождите минуту." }, { status: 429 });
    }

    const { username, password } = await req.json();
    const result = await db.execute({ sql: "SELECT * FROM users WHERE username = ?", args: [username] });
    const user = result.rows[0];

    if (!user) {
      await db.execute({ sql: "INSERT INTO login_attempts (ip, timestamp) VALUES (?, ?)", args: [ip, now] });
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password as string);
    if (!isValid) {
      await db.execute({ sql: "INSERT INTO login_attempts (ip, timestamp) VALUES (?, ?)", args: [ip, now] });
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    // Успех — сбрасываем счетчик
    await db.execute({ sql: "DELETE FROM login_attempts WHERE ip = ?", args: [ip] });

    const token = await signToken({
      id: user.id as number,
      username: user.username as string,
      account_name: user.account_name as string,
      role: user.role as string
    });

    const response = NextResponse.json({
      id: user.id, username: user.username, account_name: user.account_name,
      role: user.role, avatar: user.avatar
    });

    response.cookies.set('tavern_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 5 * 60 * 60, path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
