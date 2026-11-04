import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const result = await db.execute({ sql: "SELECT * FROM users WHERE username = ?", args: [username] });
    const user = result.rows[0];

    if (!user) return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password as string);
    if (!isValid) return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });

    return NextResponse.json({
      id: user.id, username: user.username, account_name: user.account_name,
      role: user.role, avatar: user.avatar
    });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
