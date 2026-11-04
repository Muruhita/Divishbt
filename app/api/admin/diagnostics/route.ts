import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    await db.execute("SELECT 1");
    return NextResponse.json({ status: "ok", latency: Date.now() - start, message: "База данных в норме" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
