import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password, account_name, role, requesterRole } = await req.json();

    // Проверка иерархии
    const roles = ["low", "high", "guardian", "creator", "owner"];
    const reqIdx = roles.indexOf(requesterRole);
    const newIdx = roles.indexOf(role);

    if (reqIdx <= newIdx) {
      return NextResponse.json({ error: "Недостаточно прав для создания этого ранга" }, { status: 403 });
    }

    // Хешируем пароль для безопасного входа
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute({
      sql: "INSERT INTO users (username, password, plain_password, account_name, role) VALUES (?, ?, ?, ?, ?)",
      args: [username, hashedPassword, password, account_name, role], // <--- password записывается в plain_password
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    return NextResponse.json({ error: "Ошибка (возможно, логин занят)" }, { status: 400 });
  }
}
