import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, HttpError } from "@/lib/auth";

/* GET : paramètres (code invitation, état du sondage, question). */
export async function GET() {
  try {
    await requireAdmin();
    const [invite, pollOpen, pollTitle] = await Promise.all([
      db.setting.findUnique({ where: { key: "inviteCode" } }),
      db.setting.findUnique({ where: { key: "pollOpen" } }),
      db.setting.findUnique({ where: { key: "pollTitle" } }),
    ]);
    return NextResponse.json({
      inviteCode: invite?.value ?? "CULTURE34",
      pollOpen: (pollOpen?.value ?? "true") === "true",
      pollTitle: pollTitle?.value ?? "",
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin settings get error", err);
    return NextResponse.json({ error: "Chargement des paramètres impossible." }, { status: 500 });
  }
}

const putSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(4, "Le code d'invitation doit contenir au moins 4 caractères.")
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/, "Lettres et chiffres uniquement (sans espaces).")
    .optional(),
  pollOpen: z.boolean().optional(),
  pollTitle: z.string().trim().max(200).optional(),
});

/* PUT : modifier les paramètres. */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const parsed = putSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Données invalides.");
    }
    const { inviteCode, pollOpen, pollTitle } = parsed.data;

    const ops = [];
    if (inviteCode !== undefined) {
      ops.push(db.setting.upsert({
        where: { key: "inviteCode" },
        update: { value: inviteCode.toUpperCase() },
        create: { key: "inviteCode", value: inviteCode.toUpperCase() },
      }));
    }
    if (pollOpen !== undefined) {
      ops.push(db.setting.upsert({
        where: { key: "pollOpen" },
        update: { value: String(pollOpen) },
        create: { key: "pollOpen", value: String(pollOpen) },
      }));
    }
    if (pollTitle !== undefined) {
      ops.push(db.setting.upsert({
        where: { key: "pollTitle" },
        update: { value: pollTitle },
        create: { key: "pollTitle", value: pollTitle },
      }));
    }
    if (ops.length === 0) throw new HttpError(400, "Rien à mettre à jour.");
    await db.$transaction(ops);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin settings put error", err);
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
