import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import { slugify, excerptOf } from "@/lib/files";

/* GET : journal public (articles publiés). */
export async function GET(_req: NextRequest) {
  try {
    const posts = await db.post.findMany({
      where: { published: true },
      orderBy: [{ createdAt: "desc" }],
      include: {
        author: { select: { id: true, name: true } },
        mediaFile: { select: { id: true, mimeType: true } },
      },
    });

    return NextResponse.json({
      items: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        kind: p.kind,
        coverName: p.coverName,
        hasMedia: Boolean(p.mediaFileId),
        mediaKind: p.mediaFile ? p.mediaFile.mimeType.split("/")[0] : null,
        excerpt: excerptOf(p.content),
        createdAt: p.createdAt,
        author: p.author,
      })),
    });
  } catch (err) {
    console.error("posts list error", err);
    return NextResponse.json({ error: "Chargement du journal impossible." }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().trim().min(4, "Titre trop court (4 caractères minimum).").max(120),
  content: z.string().trim().min(20, "Écrivez au moins quelques phrases (20 caractères minimum).").max(20000),
  kind: z.enum(["ARTICLE", "PHOTO", "CAPSULE"]).default("ARTICLE"),
  coverName: z.string().regex(/^[a-z0-9-]+\.(webp|jpg|png)$/, "Couverture invalide.").optional().nullable(),
  mediaFileId: z.string().optional().nullable(),
});

/* POST : nouvelle entrée dans le journal (membres connectés). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Données invalides.");
    }
    const { title, content, kind, coverName, mediaFileId } = parsed.data;

    let mediaOk: string | null = null;
    if (mediaFileId) {
      const f = await db.fileItem.findUnique({ where: { id: mediaFileId } });
      if (!f || f.uploaderId !== user.id) {
        throw new HttpError(400, "Fichier attaché introuvable parmi vos envois.");
      }
      mediaOk = f.id;
    }

    let slug = slugify(title);
    const exists = await db.post.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const post = await db.post.create({
      data: {
        slug,
        title,
        content,
        kind,
        coverName: coverName ?? null,
        mediaFileId: mediaOk,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      item: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        kind: post.kind,
        coverName: post.coverName,
        hasMedia: Boolean(post.mediaFileId),
        excerpt: excerptOf(post.content),
        createdAt: post.createdAt,
        author: post.author,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("post create error", err);
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
