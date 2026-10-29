import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/* GET : options du sondage + résultats (membres connectés) + mes votes. */
export async function GET(_req: NextRequest) {
  try {
    const user = await getSessionUser();

    const [options, openSetting, titleSetting] = await Promise.all([
      db.pollOption.findMany({ orderBy: { order: "asc" } }),
      db.setting.findUnique({ where: { key: "pollOpen" } }),
      db.setting.findUnique({ where: { key: "pollTitle" } }),
    ]);

    const base = {
      pollOpen: (openSetting?.value ?? "true") === "true",
      pollTitle: titleSetting?.value ?? "Prochaine sortie de groupe : quelle(s) activité(s) vous tente(nt) le plus ?",
      options: options.map((o) => ({
        id: o.id,
        emoji: o.emoji,
        label: o.label,
        description: o.description,
        order: o.order,
      })),
    };

    if (!user) {
      return NextResponse.json({ ...base, results: null, myVotes: null, voters: null });
    }

    const votes = await db.vote.findMany({
      select: { optionId: true, userId: true },
    });
    const counts = new Map<string, number>();
    const voters = new Set<string>();
    for (const v of votes) {
      counts.set(v.optionId, (counts.get(v.optionId) ?? 0) + 1);
      voters.add(v.userId);
    }

    return NextResponse.json({
      ...base,
      results: options.map((o) => ({ optionId: o.id, count: counts.get(o.id) ?? 0 })),
      voters: voters.size,
      myVotes: votes.filter((v) => v.userId === user.id).map((v) => v.optionId),
    });
  } catch (err) {
    console.error("poll get error", err);
    return NextResponse.json({ error: "Chargement du sondage impossible." }, { status: 500 });
  }
}
