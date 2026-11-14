import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    
    // Оборачиваем запрос в Promise.race с таймаутом (5 сек)
    const queryPromise = db.execute("SELECT 1");
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Превышено время ожидания (5 сек). База данных Turso не отвечает.")), 5000)
    );

    await Promise.race([queryPromise, timeoutPromise]);

    return NextResponse.json({ 
      status: "ok", 
      latency: Date.now() - start, 
      message: "База данных в норме" 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
