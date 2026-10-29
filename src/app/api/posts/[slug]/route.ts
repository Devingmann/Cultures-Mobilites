import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser, requireUser, HttpError } from "@/lib/auth";
import { deleteCover, excerptOf } from "@/lib/files";

/* GET : un article par slug (public), le média attaché reste réservé aux membres. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
        mediaFile: { select: { id: true, title: true, mimeType: true } },
      },
    });
    if (!post || !post.published) {
      throw new HttpError(404, "Article introuvable.");
    }
    const user = await getSessionUser();
    return NextResponse.json({
      item: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        kind: post.kind,
        coverName: post.coverName,
        createdAt: post.createdAt,
        author: post.author,
        excerpt: excerptOf(post.content),
        media: post.mediaFile
          ? {
              id: post.mediaFile.id,
              title: post.mediaFile.title,
              mimeType: post.mediaFile.mimeType,
              // le contenu média ne part que pour les membres connectés
              url: user ? `/api/files/${post.mediaFile.id}/raw` : null,
            }
          : null,
        isMine: user ? post.authorId === user.id : false,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("post get error", err);
    return NextResponse.json({ error: "Chargement de l'article impossible." }, { status: 500 });
  }
}

/* PUT : modification par l'auteur ou un admin (slug conservé). */
const putSchema = z.object({
  title: z.string().trim().min(4, "Titre trop court (4 caractères minimum).").max(120).optional(),
  content: z.string().trim().min(20, "Écrivez au moins quelques phrases (20 caractères minimum).").max(20000).optional(),
  kind: z.enum(["ARTICLE", "PHOTO", "CAPSULE"]).optional(),
  coverName: z
    .string()
    .regex(/^[a-z0-9-]+\.(webp|jpg|png)$/, "Couverture invalide.")
    .nullable()
    .optional(),
  mediaFileId: z.string().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireUser();
    const { slug } = await params;
    const post = await db.post.findUnique({ where: { slug } });
    if (!post) throw new HttpError(404, "Article introuvable.");
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      throw new HttpError(403, "Seul l'auteur ou un administrateur peut modifier cet article.");
    }
    const parsed = putSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Données invalidées.");
    }
    const { title, content, kind, coverName, mediaFileId } = parsed.data;

    let mediaOk: string | null | undefined;
    if (mediaFileId !== undefined) {
      if (mediaFileId === null) {
        mediaOk = null;
      } else {
        const f = await db.fileItem.findUnique({ where: { id: mediaFileId } });
        if (!f || f.uploaderId !== user.id) {
          throw new HttpError(400, "Fichier attaché introuvable parmi vos envois.");
        }
        mediaOk = f.id;
      }
    }

    const data: {
      title?: string;
      content?: string;
      kind?: string;
      coverName?: string | null;
      mediaFileId?: string | null;
    } = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (kind !== undefined) data.kind = kind;
    if (coverName !== undefined) data.coverName = coverName;
    if (mediaOk !== undefined) data.mediaFileId = mediaOk;
    if (Object.keys(data).length === 0) throw new HttpError(400, "Rien à mettre à jour.");

    const updated = await db.post.update({
      where: { id: post.id },
      data,
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      item: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        kind: updated.kind,
        coverName: updated.coverName,
        hasMedia: Boolean(updated.mediaFileId),
        excerpt: excerptOf(updated.content),
        createdAt: updated.createdAt,
        author: updated.author,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("post put error", err);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

/* DELETE : suppression par l'auteur ou un admin. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireUser();
    const { slug } = await params;
    const post = await db.post.findUnique({ where: { slug } });
    if (!post) throw new HttpError(404, "Article introuvable.");
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      throw new HttpError(403, "Seul l'auteur ou un administrateur peut supprimer cet article.");
    }
    await db.post.delete({ where: { id: post.id } });
    if (post.coverName) await deleteCover(post.coverName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("post delete error", err);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
