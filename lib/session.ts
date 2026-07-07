import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';
const key = new TextEncoder().encode(secretKey);

// 1. Encrypt the payload into a JWT string
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

// 2. Decrypt the JWT string back into a payload
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

// 3. Create the session cookie
export async function createSession(userId: string, name: string) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await encrypt({ userId, name, expires });

  // THE FIX: We must await cookies() in modern Next.js
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true, // Crucial: Prevents JavaScript XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

// 4. Verify the session exists
export async function verifySession() {
  // THE FIX: We must await cookies() here too
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  
  if (!cookie) return null;

  try {
    const session = await decrypt(cookie);
    if (!session || !session.userId) return null;
    return session;
  } catch (error) {
    console.error('Failed to verify session');
    return null;
  }
}

// 5. Destroy the session (Logout)
export async function deleteSession() {
  // THE FIX: And await cookies() here
  const cookieStore = await cookies();
  cookieStore.delete('session');
}