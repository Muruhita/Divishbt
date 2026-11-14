import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { unstable_cache, revalidateTag } from "next/cache";

export const dynamic = 'force-dynamic';

const getInfoPages = unstable_cache(
  async () => {
    const result = await db.execute("SELECT * FROM info_pages");
    return result.rows;
  },
  ['info-pages-list'],
  { tags: ['info-pages'] }
);

export async function GET() {
  try { return NextResponse.json(await getInfoPages()); } catch { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const rolesRes = await db.execute("SELECT id, level FROM roles");
    const rolesMap = new Map(rolesRes.rows.map(r => [r.id, Number(r.level)]));
    const userLevel = rolesMap.get(user.role) || 0;
    
    if (user.role !== 'owner' && user.role !== 'creator' && userLevel < 2) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const { id, content } = await req.json();
    await db.execute({ sql: "UPDATE info_pages SET content = ? WHERE id = ?", args: [content, id] });
    await db.execute({ sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)", args: ["ИЗМЕНЕНИЕ_ПРАВИЛ", id, user.account_name, user.role] });
    
    revalidateTag('info-pages');
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 }); }
}
