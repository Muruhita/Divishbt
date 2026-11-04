import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM categories ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    await db.execute({ sql: "INSERT INTO categories (name) VALUES (?)", args: [name] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [searchParams.get("id")] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
