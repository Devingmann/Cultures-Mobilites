import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, HttpError } from "@/lib/auth";

/* GET : tableau de bord admin. */
export async function GET() {
  try {
    await requireAdmin();
    const [users, files, posts, votes, pollOptions] = await Promise.all([
      db.user.count(),
      db.fileItem.aggregate({ _count: { _all: true }, _sum: { size: true } }),
      db.post.count(),
      db.vote.findMany({ select: { userId: true } }),
      db.pollOption.count(),
    ]);
    return NextResponse.json({
      members: users,
      files: files._count._all,
      totalSize: files._sum.size ?? 0,
      posts,
      votes: votes.length,
      voters: new Set(votes.map((v) => v.userId)).size,
      pollOptions,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin stats error", err);
    return NextResponse.json({ error: "Chargement des statistiques impossible." }, { status: 500 });
  }
}
