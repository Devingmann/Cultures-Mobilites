import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import { MAX_COVER_SIZE, ensureCovers, deleteCover } from "@/lib/files";

/* POST : image de couverture pour le journal — redimensionnée via sharp. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Aucune image reçue.");
    if (file.size > MAX_COVER_SIZE) {
      throw new HttpError(400, "Image trop lourde (10 Mo maximum).");
    }
    if (!file.type.startsWith("image/")) {
      throw new HttpError(400, "Le fichier doit être une image.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `cover-${user.id.slice(0, 6)}-${crypto.randomBytes(6).toString("hex")}.webp`;
    await ensureCovers();
    await sharp(buffer)
      .rotate()
      .resize(1600, 900, { fit: "cover", position: "centre" })
      .webp({ quality: 82 })
      .toFile(`${process.cwd()}/public/covers/${name}`);

    return NextResponse.json({ coverName: name, url: `/covers/${name}` });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("cover upload error", err);
    return NextResponse.json({ error: "Traitement de l'image impossible." }, { status: 500 });
  }
}

/* DELETE : nettoyage d'une couverture orpheline. */
export async function DELETE(req: NextRequest) {
  try {
    await requireUser();
    const name = req.nextUrl.searchParams.get("name") ?? "";
    if (/^[a-z0-9-]+\.webp$/.test(name)) {
      const used = await db.post.count({ where: { coverName: name } });
      if (used === 0) await deleteCover(name);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
