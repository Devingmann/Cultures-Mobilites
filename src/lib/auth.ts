import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "cm_session";
const SESSION_DAYS = 30;
const SCRYPT_KEYLEN = 64;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/* ---------- Mots de passe : scrypt natif Node (aucune dépendance) ---------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, SCRYPT_KEYLEN, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
    .toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const candidate = crypto
      .scryptSync(password, salt, SCRYPT_KEYLEN, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
      .toString("hex");
    const a = Buffer.from(candidate, "hex");
    const b = Buffer.from(hash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/* ---------- Sessions persistées en base, cookie httpOnly ---------- */

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.session.create({
    data: { tokenHash: sha256(token), userId, expiresAt },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // preview en HTTP derrière proxy ; sameSite protège le reste
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await db.session.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
      }
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: sha256(token) } }).catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

/* ---------- Garde-fous pour les routes API ---------- */

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "Connexion requise.");
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new HttpError(403, "Accès réservé aux administrateurs.");
  return user;
}

/* ---------- Anti brute-force sur la connexion ---------- */

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

export function checkLoginRate(key: string): { ok: boolean; retryInMin: number } {
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && rec.count >= MAX_FAILED_ATTEMPTS && rec.resetAt > now) {
    return { ok: false, retryInMin: Math.ceil((rec.resetAt - now) / 60000) };
  }
  return { ok: true, retryInMin: 0 };
}

export function registerFailedLogin(key: string): void {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + LOCK_MINUTES * 60 * 1000 });
  } else {
    rec.count += 1;
  }
}

export function clearFailedLogins(key: string): void {
  attempts.delete(key);
}
