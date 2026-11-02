import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await db.execute("SELECT * FROM archive ORDER BY id DESC");
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, category, description, symbol, dangerLevel } = body;
  
  await db.execute({
    sql: "INSERT INTO archive (title, category, description, symbol, danger_level) VALUES (?, ?, ?, ?, ?)",
    args: [title, category, description, symbol || null, dangerLevel || null],
  });
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await db.execute({ sql: "DELETE FROM archive WHERE id = ?", args: [id as string] });
  return NextResponse.json({ success: true });
}
