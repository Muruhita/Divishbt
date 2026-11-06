import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 100");
    return NextResponse.json(result.rows);
  } catch (error) { return NextResponse.json({ error: "Ошибка получения логов" }, { status: 500 }); }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || (user.role !== 'owner' && user.role !== 'creator')) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    await db.execute("DELETE FROM logs");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при очистке логов" }, { status: 500 });
  }
}
