import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSession, checkLoginRate, registerFailedLogin, clearFailedLogins, HttpError } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Données invalides.");
    }
    const { email, password } = parsed.data;

    const key = `login:${email}:${req.headers.get("x-forwarded-for") ?? "local"}`;
    const rate = checkLoginRate(key);
    if (!rate.ok) {
      throw new HttpError(
        429,
        `Trop de tentatives. Réessayez dans ${rate.retryInMin} minute(s).`
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      registerFailedLogin(key);
      throw new HttpError(401, "E-mail ou mot de passe incorrect.");
    }

    clearFailedLogins(key);
    await createSession(user.id);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("login error", err);
    return NextResponse.json({ error: "Connexion impossible pour le moment." }, { status: 500 });
  }
}
