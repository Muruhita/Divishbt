// Простой in-memory rate limiter для защиты от спама (работает в рамках одного инстанса Vercel)
const cache = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit: number = 15, windowMs: number = 60000) {
  const now = Date.now();
  const record = cache.get(ip);

  // Если записи нет или время вышло, создаем новую
  if (!record || now > record.reset) {
    cache.set(ip, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  // Если лимит превышен
  if (record.count >= limit) {
    return { 
      success: false, 
      retryAfter: Math.ceil((record.reset - now) / 1000) 
    };
  }

  // Увеличиваем счетчик
  record.count++;
  return { success: true, remaining: limit - record.count };
}
