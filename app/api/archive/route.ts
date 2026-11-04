import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Получаем общее количество для пагинации
    const countRes = await db.execute("SELECT COUNT(*) as total FROM archive");
    const total = countRes.rows[0].total as number;

    // Получаем записи для текущей страницы
    const result = await db.execute({
      sql: "SELECT * FROM archive ORDER BY id DESC LIMIT ? OFFSET ?",
      args: [limit, offset]
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
    
    // Данные для лога берем из первого элемента (предполагаем, что юзер один)
    const userName = items[0].authorName || "Неизвестно";
    const userRole = items[0].authorRole || "low";

    for (const item of items) {
      await db.execute({
        sql: "INSERT INTO archive (title, category, description, symbol, danger_level, image) VALUES (?, ?, ?, ?, ?, ?)",
        args: [item.title, item.category, item.description, item.symbol || null, item.dangerLevel || null, item.image || null],
      });
      
      // Запись в лог
      await db.execute({
        sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
        args: ["СОЗДАНИЕ", item.title, userName, userRole],
      });
    }
    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при добавлении" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const item = await req.json();
    if (!item.id) return NextResponse.json({ error: "ID не указан" }, { status: 400 });

    await db.execute({
      sql: `UPDATE archive SET title = ?, category = ?, description = ?, symbol = ?, danger_level = ?, image = ? WHERE id = ?`,
      args: [item.title, item.category, item.description, item.symbol || null, item.dangerLevel || null, item.image || null, item.id],
    });

    // Запись в лог
    await db.execute({
      sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
      args: ["ИЗМЕНЕНИЕ", item.title, item.authorName || "Неизвестно", item.authorRole || "low"],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const title = searchParams.get("title");
    const authorName = searchParams.get("authorName") || "Неизвестно";
    const authorRole = searchParams.get("authorRole") || "low";
    
    if (!id) return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    
    await db.execute({ sql: "DELETE FROM archive WHERE id = ?", args: [id] });
    
    // Запись в лог
    await db.execute({
      sql: "INSERT INTO logs (action, item_title, user_name, user_role) VALUES (?, ?, ?, ?)",
      args: ["УДАЛЕНИЕ", title, authorName, authorRole],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}
