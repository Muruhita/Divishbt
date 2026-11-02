import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requesterRole = searchParams.get("role") || "low";
  
  const roles = ["low", "high", "guardian", "creator", "owner"];
  const reqIdx = roles.indexOf(requesterRole);

  // Получаем всех пользователей
  const result = await db.execute("SELECT id, username, account_name, role, plain_password FROM users");
  
  // Фильтруем: видим только себя и тех, кто ниже по рангу
  const filtered = result.rows.filter(u => {
    const userIdx = roles.indexOf(u.role as string);
    return userIdx <= reqIdx; 
  });

  return NextResponse.json(filtered);
}
