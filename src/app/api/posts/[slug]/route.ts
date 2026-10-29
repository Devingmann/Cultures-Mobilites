import { NextRequest, NextResponse } from "next/server";
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
