import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const requester = token ? await verifyToken(token) : null;

    if (!requester || requester.role !== 'owner') return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });

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
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const requester = token ? await verifyToken(token) : null;

    if (!requester) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { id, name, level } = await req.json();

    if (id === "owner" && requester.role !== "owner") {
      return NextResponse.json({ error: "Только Овнер может менять свою роль" }, { status: 403 });
    }

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const reqLevel = rolesMap.get(requester.role) || 0;
    const targetLevel = rolesMap.get(id) || 0;

    if (requester.role !== "owner" && reqLevel <= targetLevel) {
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
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const requester = token ? await verifyToken(token) : null;

    if (!requester) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id === "owner") return NextResponse.json({ error: "Нельзя удалить Овнера" }, { status: 400 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const reqLevel = rolesMap.get(requester.role) || 0;
    const targetLevel = rolesMap.get(id || "") || 0;

    if (requester.role !== "owner" && reqLevel <= targetLevel) {
      return NextResponse.json({ error: "Недостаточно прав для удаления этой роли" }, { status: 403 });
    }

    await db.execute({ sql: "DELETE FROM roles WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
