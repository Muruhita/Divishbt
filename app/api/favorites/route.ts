import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const result = await db.execute({
      sql: "SELECT archive_id FROM favorites WHERE user_id = ?",
      args: [user.id],
    });

    return NextResponse.json(result.rows.map(r => r.archive_id));
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения избранного" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { archiveId, action } = await req.json();

    if (!archiveId) return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });

    if (action === "add") {
      await db.execute({
        sql: "INSERT OR IGNORE INTO favorites (user_id, archive_id) VALUES (?, ?)",
        args: [user.id, archiveId],
      });
    } else if (action === "remove") {
      await db.execute({
        sql: "DELETE FROM favorites WHERE user_id = ? AND archive_id = ?",
        args: [user.id, archiveId],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении избранного" }, { status: 500 });
  }
}
