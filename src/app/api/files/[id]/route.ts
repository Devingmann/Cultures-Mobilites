import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import { deleteStoredFile } from "@/lib/files";

/* DELETE : l'auteur du fichier ou un admin peut supprimer. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const file = await db.fileItem.findUnique({ where: { id } });
    if (!file) throw new HttpError(404, "Fichier introuvable.");
    if (file.uploaderId !== user.id && user.role !== "ADMIN") {
      throw new HttpError(403, "Seul l'auteur du fichier ou un administrateur peut le supprimer.");
    }
    await db.post.updateMany({ where: { mediaFileId: id }, data: { mediaFileId: null } });
    await db.fileItem.delete({ where: { id } });
    await deleteStoredFile(file.fileName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("file delete error", err);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
