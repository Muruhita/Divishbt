// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  // Проверяем авторизацию (загружать могут только стаффы)
  const cookieStore = await cookies();
  const token = cookieStore.get('tavern_token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) {
    return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    // Ограничение 1 МБ
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: 'Файл больше 1МБ' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public', // Ваше хранилище создано как Public
      addRandomSuffix: true, // Чтобы имена не пересекались
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Blob upload error:', error);
    // Если ошибка связана с отсутствием токена
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json({ error: 'В Vercel не добавлен BLOB_READ_WRITE_TOKEN' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Ошибка загрузки в Blob' }, { status: 500 });
  }
}
