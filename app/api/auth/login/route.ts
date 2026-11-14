import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Защита от брутфорса (5 попыток в минуту)
    const limitRes = rateLimit(ip, 5, 60000);
    if (!limitRes.success) {
      return NextResponse.json({ error: `Слишком много попыток входа. Подождите ${limitRes.retryAfter} сек.` }, { status: 429 });
    }

    const { username, password } = await req.json();
    const result = await db.execute({ sql: "SELECT * FROM users WHERE username = ?", args: [username] });
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password as string);
    if (!isValid) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // <--- СТРОГАЯ ЗАЩИТА CSRF
      maxAge: 5 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
