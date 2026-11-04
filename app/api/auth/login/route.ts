import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Простой In-Memory Rate Limiter (защита от брутфорса)
const loginAttempts = new Map<string, { count: number, lockUntil: number }>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Проверка блокировки
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.lockUntil > now) {
      const waitSec = Math.ceil((attempt.lockUntil - now) / 1000);
      return NextResponse.json({ error: `Слишком много попыток. Подождите ${waitSec} сек.` }, { status: 429 });
    }

    const { username, password } = await req.json();
    const result = await db.execute({ sql: "SELECT * FROM users WHERE username = ?", args: [username] });
    const user = result.rows[0];

    if (!user) {
      registerFailedAttempt(ip);
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password as string);
    if (!isValid) {
      registerFailedAttempt(ip);
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    // Успешный вход - сбрасываем счетчик
    loginAttempts.delete(ip);

    // Генерируем JWT
    const token = await signToken({
      id: user.id as number,
      username: user.username as string,
      account_name: user.account_name as string,
      role: user.role as string
    });

    // Возвращаем данные пользователя (без пароля) и ставим httpOnly куку
    const response = NextResponse.json({
      id: user.id, username: user.username, account_name: user.account_name,
      role: user.role, avatar: user.avatar
    });

    response.cookies.set('tavern_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60 * 60, // 5 часов
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

function registerFailedAttempt(ip: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  attempt.count += 1;
  
  if (attempt.count >= 5) {
    attempt.lockUntil = now + 60000; // Блокировка на 1 минуту после 5 попыток
    attempt.count = 0;
  }
  loginAttempts.set(ip, attempt);
}
