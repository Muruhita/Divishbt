import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "Нет ID пользователя" }, { status: 400 });

    const result = await db.execute({
      sql: "SELECT archive_id FROM favorites WHERE user_id = ?",
      args: [userId],
    });

    return NextResponse.json(result.rows.map(r => r.archive_id));
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения избранного" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, archiveId, action } = await req.json();

    if (!userId || !archiveId) return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });

    if (action === "add") {
      await db.execute({
        sql: "INSERT OR IGNORE INTO favorites (user_id, archive_id) VALUES (?, ?)",
        args: [userId, archiveId],
      });
    } else if (action === "remove") {
      await db.execute({
        sql: "DELETE FROM favorites WHERE user_id = ? AND archive_id = ?",
        args: [userId, archiveId],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении избранного" }, { status: 500 });
  }
}
