import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const archives = await db.execute("SELECT COUNT(*) as c FROM archive");
    const users = await db.execute("SELECT COUNT(*) as c FROM users");
    const categories = await db.execute("SELECT COUNT(*) as c FROM categories");
    
    return NextResponse.json({
      archives: Number(archives.rows[0].c),
      users: Number(users.rows[0].c),
      categories: Number(categories.rows[0].c),
    });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения статистики" }, { status: 500 });
  }
}
