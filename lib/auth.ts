import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("КРИТИЧЕСКАЯ ОШИБКА: Переменная JWT_SECRET не задана в окружении!");
    }
    return new TextEncoder().encode('dev_secret_only_for_local');
  }
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: { id: number; username: string; role: string; account_name: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5h')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { id: number; username: string; role: string; account_name: string };
  } catch {
    return null;
  }
}
