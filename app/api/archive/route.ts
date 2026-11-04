import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

function sanitize(text: string) {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || "Все";
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "guest"; // Получаем роль

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
    
    // СКРЫВАЕМ ЧЕРНОВИКИ ОТ ВСЕХ, КРОМЕ АДМИНОВ
    if (role === "guest" || role === "low") {
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
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];
    
    for (const item of items) {
      await db.execute({
        sql: "INSERT INTO archive (title, category, description, symbol, danger_level, image, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [
          sanitize(item.title), item.category, sanitize(item.description), sanitize(item.symbol || ""), 
          item.dangerLevel || null, item.image || null, item.is_draft ? 1 : 0
        ],
      });
      try {
        await db.execute({
          sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
          args: ["СОЗДАНИЕ", sanitize(item.title), item.authorName || "Неизвестно", item.authorRole || "low"],
        });
      } catch (e) { console.error("Лог не записан:", e); }
    }
    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при добавлении" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const item = await req.json();
    if (!item.id) return NextResponse.json({ error: "ID не указан" }, { status: 400 });

    await db.execute({
      sql: `UPDATE archive SET title = ?, category = ?, description = ?, symbol = ?, danger_level = ?, image = ?, is_draft = ? WHERE id = ?`,
      args: [
        sanitize(item.title), item.category, sanitize(item.description), sanitize(item.symbol || ""), 
        item.dangerLevel || null, item.image || null, item.is_draft ? 1 : 0, item.id
      ],
    });
    try {
      await db.execute({
        sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
        args: ["ИЗМЕНЕНИЕ", sanitize(item.title), item.authorName || "Неизвестно", item.authorRole || "low"],
      });
    } catch (e) { console.error("Лог не записан:", e); }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // ... (остается без изменений)
}
