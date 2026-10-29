import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, HttpError } from "@/lib/auth";
import { deleteStoredFile } from "@/lib/files";

/* PATCH : promotion / rétrogradation d'un membre. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const parsed = z.object({ role: z.enum(["MEMBER", "ADMIN"]) }).safeParse(await req.json());
    if (!parsed.success) throw new HttpError(400, "Rôle invalide.");
    if (id === admin.id && parsed.data.role === "MEMBER") {
      throw new HttpError(400, "Vous ne pouvez pas vous retirer les droits d'administration.");
    }
    const updated = await db.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });
    return NextResponse.json({
      user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin user patch error", err);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

/* DELETE : supprimer un compte (fichiers physiques compris). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.id) {
      throw new HttpError(400, "Vous ne pouvez pas supprimer votre propre compte.");
    }
    const files = await db.fileItem.findMany({ where: { uploaderId: id }, select: { fileName: true } });
    await db.user.delete({ where: { id } });
    for (const f of files) await deleteStoredFile(f.fileName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin user delete error", err);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
