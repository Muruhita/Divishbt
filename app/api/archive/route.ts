import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM archive ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    for (const item of items) {
      await db.execute({
        sql: "INSERT INTO archive (title, category, description, symbol, danger_level, image) VALUES (?, ?, ?, ?, ?, ?)",
        args: [
          item.title, 
          item.category, 
          item.description, 
          item.symbol || null, 
          item.dangerLevel || null,
          item.image || null // <--- Сохраняем картинку
        ],
      });
    }
    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при добавлении" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    await db.execute({ sql: "DELETE FROM archive WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}
