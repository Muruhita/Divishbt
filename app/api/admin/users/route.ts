import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterRole = searchParams.get("role") || "low";
    
    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, r.level]));
    
    const reqLevel = rolesMap.get(requesterRole) as number || 0;

    const result = await db.execute("SELECT id, username, account_name, role, plain_password, avatar FROM users");
    
    const filtered = result.rows.filter(u => {
      const userLevel = rolesMap.get(u.role as string) as number || 0;
      return userLevel <= reqLevel; 
    });

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const requesterRole = searchParams.get("requesterRole");

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, r.level]));
    const reqLevel = rolesMap.get(requesterRole as string) as number || 0;

    const targetRes = await db.execute({ sql: "SELECT role FROM users WHERE id = ?", args: [id] });
    const targetLevel = rolesMap.get(targetRes.rows[0].role as string) as number || 0;

    if (reqLevel <= targetLevel) return NextResponse.json({ error: "Нет прав" }, { status: 403 });

    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
