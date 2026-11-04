import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute("SELECT * FROM roles ORDER BY level DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, level } = await req.json();
    const id = "role_" + Date.now().toString();
    await db.execute({ sql: "INSERT INTO roles (id, name, level) VALUES (?, ?, ?)", args: [id, name, level] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, level, requesterRole } = await req.json();

    // 1. Жесткая защита Овнера: изменить его роль может только сам Овнер
    if (id === "owner" && requesterRole !== "owner") {
      return NextResponse.json({ error: "Только Овнер может менять свою роль" }, { status: 403 });
    }

    // 2. Проверка иерархии для всех остальных
    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const reqLevel = rolesMap.get(requesterRole) || 0;
    const targetLevel = rolesMap.get(id) || 0;

    if (requesterRole !== "owner" && reqLevel <= targetLevel) {
      return NextResponse.json({ error: "Недостаточно прав для изменения этой роли" }, { status: 403 });
    }

    await db.execute({ sql: "UPDATE roles SET name = ?, level = ? WHERE id = ?", args: [name, level, id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const requesterRole = searchParams.get("requesterRole");

    if (id === "owner") return NextResponse.json({ error: "Нельзя удалить Овнера" }, { status: 400 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const reqLevel = rolesMap.get(requesterRole || "") || 0;
    const targetLevel = rolesMap.get(id || "") || 0;

    if (requesterRole !== "owner" && reqLevel <= targetLevel) {
      return NextResponse.json({ error: "Недостаточно прав для удаления этой роли" }, { status: 403 });
    }

    await db.execute({ sql: "DELETE FROM roles WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
