import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    // Если переменных нет, db.ts выдаст ошибку подключения, и мы поймаем её
    await db.execute("SELECT 1");
    return NextResponse.json({ status: "ok", latency: Date.now() - start, message: "База данных в норме" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
