import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM roles ORDER BY level DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, level } = await req.json();
    const id = "role_" + Date.now().toString();
    await db.execute({ sql: "INSERT INTO roles (id, name, level) VALUES (?, ?, ?)", args: [id, name, level] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, level } = await req.json();
    await db.execute({ sql: "UPDATE roles SET name = ?, level = ? WHERE id = ?", args: [name, level, id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("id") === "owner") return NextResponse.json({ error: "Нельзя" }, { status: 400 });
    await db.execute({ sql: "DELETE FROM roles WHERE id = ?", args: [searchParams.get("id")] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
