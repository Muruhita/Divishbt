import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { unstable_cache, revalidateTag } from "next/cache";

export const dynamic = 'force-dynamic';

const getCategories = unstable_cache(
  async () => {
    const result = await db.execute("SELECT * FROM categories ORDER BY id ASC");
    return result.rows;
  },
  ['categories-list'],
  { tags: ['categories'] }
);

export async function GET() {
  try {
    return NextResponse.json(await getCategories());
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function POST(req: Request) {
  // ... (авторизация)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    if (user.role !== 'owner' && (rolesMap.get(user.role) || 0) < 2) return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });

    const { name } = await req.json();
    await db.execute({ sql: "INSERT INTO categories (name) VALUES (?)", args: [name] });
    revalidateTag('categories');
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  // ... (авторизация)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    if (user.role !== 'owner' && (rolesMap.get(user.role) || 0) < 2) return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [searchParams.get("id")] });
    revalidateTag('categories');
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}
