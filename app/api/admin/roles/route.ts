import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await db.execute("SELECT * FROM roles ORDER BY level DESC");
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { name, level } = await req.json();
  if (!name || level === undefined) return NextResponse.json({ error: "Заполните поля" }, { status: 400 });
  
  // Генерируем уникальный ID для новой роли
  const id = "role_" + Date.now().toString();
  await db.execute({ sql: "INSERT INTO roles (id, name, level) VALUES (?, ?, ?)", args: [id, name, level] });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { id, name, level } = await req.json();
  if (!id || !name || level === undefined) return NextResponse.json({ error: "Заполните поля" }, { status: 400 });
  await db.execute({ sql: "UPDATE roles SET name = ?, level = ? WHERE id = ?", args: [name, level, id] });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id === "owner") return NextResponse.json({ error: "Нельзя удалить Овнера" }, { status: 400 });
  if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });
  await db.execute({ sql: "DELETE FROM roles WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
