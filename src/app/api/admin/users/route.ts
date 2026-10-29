import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, HttpError } from "@/lib/auth";

/* GET : liste des membres. */
export async function GET() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { files: true, posts: true, votes: true } },
      },
    });
    return NextResponse.json({
      items: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        files: u._count.files,
        posts: u._count.posts,
        votes: u._count.votes,
      })),
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin users error", err);
    return NextResponse.json({ error: "Chargement des membres impossible." }, { status: 500 });
  }
}
