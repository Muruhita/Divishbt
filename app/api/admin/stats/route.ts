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
