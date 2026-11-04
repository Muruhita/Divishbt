import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Получаем все записи, у которых есть картинка
    const result = await db.execute("SELECT id, title, image FROM archive WHERE image IS NOT NULL AND image != ''");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения картинок" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    // Очищаем поле image в базе данных
    await db.execute({ sql: "UPDATE archive SET image = '' WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
