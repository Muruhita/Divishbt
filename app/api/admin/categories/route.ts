import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await db.execute("SELECT * FROM categories ORDER BY id ASC");
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Пустое имя" }, { status: 400 });
  await db.execute({ sql: "INSERT INTO categories (name) VALUES (?)", args: [name] });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });
  await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
