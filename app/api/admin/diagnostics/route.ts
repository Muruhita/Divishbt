import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    await db.execute("SELECT 1"); // Простейший запрос для проверки
    const end = Date.now();
    
    return NextResponse.json({
      status: "ok",
      latency: end - start,
      message: "База данных Turso подключена и работает стабильно."
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message || "Ошибка при подключении к базе данных"
    }, { status: 500 });
  }
}
