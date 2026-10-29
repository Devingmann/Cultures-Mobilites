import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import {
  MAX_FILE_SIZE,
  CATEGORIES,
  isCategory,
  kindFromMime,
  sanitizeName,
  safeStoredName,
  writeStoredFile,
  formatSize,
} from "@/lib/files";

/* GET : liste du drive partagé (filtres catégorie, recherche, type). */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const category = sp.get("category");
    const q = sp.get("q")?.trim();
    const kind = sp.get("kind");

    const where: { category?: string; OR?: { title: { contains: string }; description?: { contains: string } }[] } = {};
    if (category && isCategory(category)) where.category = category;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { originalName: { contains: q } },
      ];
    }

    const files = await db.fileItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { uploader: { select: { id: true, name: true } } },
    });

    let items = files.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      category: f.category,
      categoryLabel: CATEGORIES[f.category as keyof typeof CATEGORIES]?.label ?? f.category,
      categoryEmoji: CATEGORIES[f.category as keyof typeof CATEGORIES]?.emoji ?? "📁",
      originalName: f.originalName,
      mimeType: f.mimeType,
      kind: kindFromMime(f.mimeType),
      size: f.size,
      sizeLabel: formatSize(f.size),
      createdAt: f.createdAt,
      uploader: f.uploader,
      isMine: f.uploaderId === user.id,
    }));

    if (kind) {
      items = items.filter((f) => f.kind === kind);
    }

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    return NextResponse.json({ items, total: items.length, totalSizeLabel: formatSize(totalSize) });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("files list error", err);
    return NextResponse.json({ error: "Chargement du drive impossible." }, { status: 500 });
  }
}

/* POST : upload par compte (plusieurs fichiers possibles). */
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
      const storedName = safeStoredName(file.name, file.type || "application/octet-stream");
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeStoredFile(storedName, buffer);

      const item = await db.fileItem.create({
        data: {
          title: title || sanitizeName(file.name),
          description,
          category: categoryRaw,
          fileName: storedName,
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
