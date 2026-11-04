import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password, account_name, role, requesterRole } = await req.json();

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, r.level]));
    
    const reqLevel = rolesMap.get(requesterRole) as number || 0;
    const newLevel = rolesMap.get(role) as number || 0;

    if (reqLevel <= newLevel) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute({
      sql: "INSERT INTO users (username, password, plain_password, account_name, role) VALUES (?, ?, ?, ?, ?)",
      args: [username, hashedPassword, password, account_name, role],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Логин занят" }, { status: 400 });
  }
}
