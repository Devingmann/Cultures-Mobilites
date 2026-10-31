import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import { put } from "@vercel/blob"; // <--- Import du stockage Cloud Vercel Blob
import {
  MAX_FILE_SIZE,
  CATEGORIES,
  isCategory,
  kindFromMime,
  sanitizeName,
  formatSize,
} from "@/lib/files";

// (Conservez votre fonction GET existante...)

/* POST : upload par compte vers Vercel Blob. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const form = await req.formData();

    const categoryRaw = String(form.get("category") ?? "PHOTO");
    if (!isCategory(categoryRaw)) {
      throw new HttpError(400, "Catégorie de fichier inconnue.");
    }
    const title = sanitizeName(String(form.get("title") ?? ""));
    const description = String(form.get("description") ?? "").trim().slice(0, 400) || null;

    const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
    if (uploads.length === 0) {
      throw new HttpError(400, "Sélectionnez au moins un fichier.");
    }

    const created: unknown[] = [];
    for (const file of uploads) {
      if (file.size === 0) continue;
      if (file.size > MAX_FILE_SIZE) {
        throw new HttpError(
          400,
          `« ${file.name} » dépasse la limite de ${formatSize(MAX_FILE_SIZE)}.`
        );
      }

      // Envoi direct vers le stockage Cloud Vercel Blob
      const blob = await put(file.name, file, {
        access: "public",
      });

      // Stocke l'URL publique et permanente du cloud dans Prisma
      const item = await db.fileItem.create({
        data: {
          title: title || sanitizeName(file.name),
          description,
          category: categoryRaw,
          fileName: blob.url, // URL cloud permanente
          originalName: sanitizeName(file.name),
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          uploaderId: user.id,
        },
      });

      created.push({
        id: item.id,
        title: item.title,
        kind: kindFromMime(item.mimeType),
        url: blob.url,
      });
    }

    if (created.length === 0) {
      throw new HttpError(400, "Aucun fichier valide reçu.");
    }
    return NextResponse.json({ created: created.length, items: created });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("upload error", err);
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}