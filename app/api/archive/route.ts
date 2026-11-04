import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || "Все";
    const search = searchParams.get("search") || "";

    let whereConditions = [];
    let args: any[] = [];

    if (category !== "Все") {
      whereConditions.push("category = ?");
      args.push(category);
    }
    if (search) {
      whereConditions.push("(LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
      args.push(`%${search}%`, `%${search}%`);
    }
    
    // Скрываем черновики от неавторизованных или низких ролей
    const isAdmin = user && ['owner', 'creator', 'guardian', 'high'].includes(user.role);
    if (!isAdmin) {
       whereConditions.push("(is_draft IS NULL OR is_draft = 0)");
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    
    const countRes = await db.execute({ sql: `SELECT COUNT(*) as total FROM archive ${whereClause}`, args });
    const total = Number(countRes.rows[0].total);
    const offset = (page - 1) * limit;
    
    const result = await db.execute({
      sql: `SELECT * FROM archive ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset]
    });
    
    return NextResponse.json({ items: result.rows, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];
    
    for (const item of items) {
      // Базовая валидация длины
      if (!item.title || item.title.length > 200) throw new Error("Некорректный заголовок");
      if (item.image && item.image.length > 3 * 1024 * 1024) throw new Error("Картинка слишком большая (макс 2МБ)");

      await db.execute({
        sql: "INSERT INTO archive (title, category, description, symbol, danger_level, image, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [
          item.title.trim(), item.category, item.description, item.symbol || "", 
          item.dangerLevel || null, item.image || null, item.is_draft ? 1 : 0
        ],
      });
      await db.execute({
        sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
        args: ["СОЗДАНИЕ", item.title.trim(), user.account_name, user.role],
      });
    }
    return NextResponse.json({ success: true, count: items.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Ошибка при добавлении" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const item = await req.json();
    if (!item.id) return NextResponse.json({ error: "ID не указан" }, { status: 400 });

    await db.execute({
      sql: `UPDATE archive SET title = ?, category = ?, description = ?, symbol = ?, danger_level = ?, image = ?, is_draft = ? WHERE id = ?`,
      args: [
        item.title.trim(), item.category, item.description, item.symbol || "", 
        item.dangerLevel || null, item.image || null, item.is_draft ? 1 : 0, item.id
      ],
    });
    
    await db.execute({
      sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
      args: ["ИЗМЕНЕНИЕ", item.title.trim(), user.account_name, user.role],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tavern_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clear = searchParams.get("clear");

    if (clear === "true") {
      if (user.role !== "owner") return NextResponse.json({ error: "Только Овнер может очистить базу" }, { status: 403 });
      await db.execute("DELETE FROM archive");
      await db.execute({ sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)", args: ["ОЧИСТКА_БАЗЫ", "ВСЕ ЗАПИСИ", user.account_name, user.role] });
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });

    await db.execute({ sql: "DELETE FROM archive WHERE id = ?", args: [id] });
    await db.execute({ 
      sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)", 
      args: ["УДАЛЕНИЕ", `ID: ${id}`, user.account_name, user.role] 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
