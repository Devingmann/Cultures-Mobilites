import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";

/* POST : remplace l'ensemble des votes du membre (choix multiples, modifiables). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const optionIds: unknown = body?.optionIds;
    if (!Array.isArray(optionIds) || optionIds.some((v) => typeof v !== "string")) {
      throw new HttpError(400, "Sélection de vote invalide.");
    }

    const openSetting = await db.setting.findUnique({ where: { key: "pollOpen" } });
    if ((openSetting?.value ?? "true") !== "true") {
      throw new HttpError(400, "Le sondage est clôturé — les votes ne sont plus modifiables.");
    }

    const uniq = [...new Set(optionIds as string[])].slice(0, 20);
    if (uniq.length > 0) {
      const valid = await db.pollOption.findMany({
        where: { id: { in: uniq } },
        select: { id: true },
      });
      if (valid.length !== uniq.length) {
        throw new HttpError(400, "Une des options n'existe plus.");
      }
    }

    await db.$transaction([
      db.vote.deleteMany({ where: { userId: user.id } }),
      ...(uniq.length === 0
        ? []
        : [
            db.vote.createMany({
              data: uniq.map((optionId) => ({ userId: user.id!, optionId })),
            }),
          ]),
    ]);

    const votes = await db.vote.findMany({ select: { optionId: true, userId: true } });
    const counts = new Map<string, number>();
    const voters = new Set<string>();
    for (const v of votes) {
      counts.set(v.optionId, (counts.get(v.optionId) ?? 0) + 1);
      voters.add(v.userId);
    }
    const options = await db.pollOption.findMany({ orderBy: { order: "asc" } });

    return NextResponse.json({
      ok: true,
      myVotes: votes.filter((v) => v.userId === user.id).map((v) => v.optionId),
      voters: voters.size,
      results: options.map((o) => ({ optionId: o.id, count: counts.get(o.id) ?? 0 })),
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("vote error", err);
    return NextResponse.json({ error: "Enregistrement des votes impossible." }, { status: 500 });
  }
}
