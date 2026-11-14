import { NextResponse } from "next/server";

export function verifyCsrf(req: Request) {
  // В локальной разработке пропускаем, чтобы не мешало тестированию
  if (process.env.NODE_ENV !== 'production') return null;

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');

  // Если есть Origin, он должен совпадать с нашим хостом
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ error: "CSRF защита: неверный источник запроса" }, { status: 403 });
  }

  // Если Origin нет, проверяем Referer
  if (!origin && referer && host && !referer.includes(host)) {
    return NextResponse.json({ error: "CSRF защита: неверный Referer" }, { status: 403 });
  }

  // Если нет ни того, ни другого — блокируем (кроме GET запросов, но мы применяем это только к POST/PUT/DELETE)
  if (!origin && !referer) {
    return NextResponse.json({ error: "CSRF защита: отсутствуют заголовки безопасности" }, { status: 403 });
  }

  return null; // Все ок
}
