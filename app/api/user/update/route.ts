import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifyToken, signToken } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const authUser = token ? await verifyToken(token) : null;
    if (!authUser) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { oldPassword, newPassword, avatar, newUsername, newAccountName } = await req.json();
    
    const userRes = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [authUser.id] });
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    let finalUsername = user.username as string;
    let finalAccountName = user.account_name as string;
    let needsNewToken = false;

    if (newUsername && newUsername !== user.username) {
      const checkRes = await db.execute({ sql: "SELECT id FROM users WHERE username = ? AND id != ?", args: [newUsername, authUser.id] });
      if (checkRes.rows.length > 0) return NextResponse.json({ error: "Этот логин уже занят" }, { status: 400 });
      
      await db.execute({ sql: "UPDATE users SET username = ? WHERE id = ?", args: [newUsername, authUser.id] });
      finalUsername = newUsername;
      needsNewToken = true;
    }

    if (newAccountName && newAccountName !== user.account_name) {
      const checkRes = await db.execute({ sql: "SELECT id FROM users WHERE account_name = ? AND id != ?", args: [newAccountName, authUser.id] });
      if (checkRes.rows.length > 0) return NextResponse.json({ error: "Это имя уже занято другим пользователем" }, { status: 400 });

      await db.execute({ sql: "UPDATE users SET account_name = ? WHERE id = ?", args: [newAccountName, authUser.id] });
      finalAccountName = newAccountName;
      needsNewToken = true;
    }

    if (newPassword) {
      const isValid = await bcrypt.compare(oldPassword, user.password as string);
      if (!isValid) return NextResponse.json({ error: "Старый пароль неверен" }, { status: 400 });
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.execute({ sql: "UPDATE users SET password = ? WHERE id = ?", args: [hashed, authUser.id] });
    }

    if (avatar !== undefined) {
      if (avatar && avatar.length > 1024 * 1024) return NextResponse.json({ error: "Аватар слишком большой" }, { status: 400 });
      if (avatar && !avatar.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/)) {
        return NextResponse.json({ error: "Недопустимый формат аватара" }, { status: 400 });
      }
      await db.execute({ sql: "UPDATE users SET avatar = ? WHERE id = ?", args: [avatar, authUser.id] });
    }

    const response = NextResponse.json({ success: true });

    if (needsNewToken) {
      const newToken = await signToken({
        id: authUser.id,
        username: finalUsername,
        account_name: finalAccountName,
        role: authUser.role
      });
      response.cookies.set('tavern_token', newToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // <--- ЗАЩИТА CSRF
        maxAge: 5 * 60 * 60, 
        path: '/'
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении профиля" }, { status: 500 });
  }
}
