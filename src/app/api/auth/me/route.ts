import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser, requireUser, verifyPassword, hashPassword, HttpError } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

const patchSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court.").max(60).optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.")
    .max(100)
    .regex(/[A-Za-z]/, "Ajoutez au moins une lettre.")
    .regex(/[0-9]/, "Ajoutez au moins un chiffre.")
    .optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const me = await requireUser();
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Données invalides.");
    }
    const { name, currentPassword, newPassword } = parsed.data;

    const data: { name?: string; passwordHash?: string } = {};
    if (name) data.name = name;

    if (newPassword) {
      if (!currentPassword) {
        throw new HttpError(400, "Saisissez votre mot de passe actuel pour le changer.");
      }
      const full = await db.user.findUnique({ where: { id: me.id } });
      if (!full || !verifyPassword(currentPassword, full.passwordHash)) {
        throw new HttpError(401, "Mot de passe actuel incorrect.");
      }
      data.passwordHash = hashPassword(newPassword);
    }

    if (Object.keys(data).length === 0) {
      throw new HttpError(400, "Rien à mettre à jour.");
    }
    const updated = await db.user.update({ where: { id: me.id }, data });
    return NextResponse.json({
      user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("profile patch error", err);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
