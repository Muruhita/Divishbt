import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 100");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения логов" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.execute("DELETE FROM logs");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при очистке логов:", error);
    return NextResponse.json({ error: "Ошибка при очистке логов" }, { status: 500 });
  }
}
