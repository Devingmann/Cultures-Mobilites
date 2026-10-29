import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession, HttpError } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum).").max(60),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(100)
    .regex(/[A-Za-z]/, "Ajoutez au moins une lettre.")
    .regex(/[0-9]/, "Ajoutez au moins un chiffre."),
  inviteCode: z.string().trim().min(1, "Code d'invitation requis."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Données invalides.");
    }
    const { name, email, password, inviteCode } = parsed.data;

    const setting = await db.setting.findUnique({ where: { key: "inviteCode" } });
    const validCode = setting?.value ?? "CULTURE34";
    if (inviteCode.toUpperCase() !== validCode.toUpperCase()) {
      throw new HttpError(400, "Code d'invitation incorrect. Demandez-le aux animateurs du groupe.");
    }

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      throw new HttpError(409, "Un compte existe déjà avec cette adresse e-mail.");
    }

    const user = await db.user.create({
      data: { name, email, passwordHash: hashPassword(password), role: "MEMBER" },
    });

    await createSession(user.id);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("register error", err);
    return NextResponse.json({ error: "Inscription impossible pour le moment." }, { status: 500 });
  }
}
