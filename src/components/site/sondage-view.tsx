"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Lock,
  CheckCircle2,
  Save,
  Users,
  CheckCheck,
  TrendingUp,
  Loader2,
  ListChecks as PollIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import type { PollDto } from "./types";

export function SondageView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: poll, isLoading } = useQuery({
    queryKey: ["poll"],
    queryFn: () => api<PollDto>("/api/poll"),
  });

  useEffect(() => {
    if (poll?.myVotes) setSelected(new Set(poll.myVotes));
  }, [poll?.myVotes]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (!poll) return;
    if (selected.size === 0) {
      const ok = window.confirm(
        "Vous n'avez sélectionné aucune activité. Voulez-vous effacer vos votes ?"
      );
      if (!ok) return;
    }
    setSaving(true);
    try {
      await api("/api/poll/vote", {
        method: "POST",
        body: JSON.stringify({ optionIds: Array.from(selected) }),
      });
      await queryClient.invalidateQueries({ queryKey: ["poll"] });
      toast.success("Vos votes sont enregistrés — merci !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const results = useMemo(() => {
    if (!poll?.results || poll.options.length === 0) return [];
    const counts = new Map(poll.results.map((r) => [r.optionId, r.count]));
    const total = poll.voters ?? 0;
    return poll.options
      .map((o) => ({
        ...o,
        count: counts.get(o.id) ?? 0,
        pct: total > 0 ? Math.round(((counts.get(o.id) ?? 0) / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count || a.order - b.order);
  }, [poll]);

  const dirty =
    poll?.myVotes &&
    (selected.size !== poll.myVotes.length ||
      Array.from(selected).some((id) => !poll.myVotes!.includes(id)));

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" aria-label="Chargement du sondage" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        <p>Le sondage n&apos;est pas disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* En-tête */}
      <div className="text-center">
        <Badge
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            poll.pollOpen
              ? "bg-brand-teal/10 text-brand-deep"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <PollIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {poll.pollOpen ? "Sondage ouvert" : "Sondage clôturé"}
        </Badge>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {poll.pollTitle}
        </h1>
        <p className="mt-3 text-foreground/70">
          Plusieurs choix possibles — votez pour tout ce qui vous tente, vous pourrez
          modifier vos votes tant que le sondage est ouvert.
        </p>
        {user && poll.voters !== null && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-brand-teal" aria-hidden />
            {poll.voters === 0
              ? "Aucun vote pour l'instant — soyez le premier !"
              : poll.voters === 1
                ? "1 personne a voté"
                : `${poll.voters} personnes ont voté`}
          </p>
        )}
      </div>

      {/* Non connecté : aperçu verrouillé */}
      {!user ? (
        <>
          <div className="mt-10 grid gap-3 opacity-90 sm:grid-cols-2 lg:grid-cols-3">
            {poll.options.map((o) => (
              <div
                key={o.id}
                className="relative rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-soft"
              >
                <p className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {o.emoji}
                  </span>
                  <span>
                    <span className="block font-semibold leading-snug">{o.label}</span>
                    <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                      {o.description}
                    </span>
                  </span>
                </p>
                <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange/10">
                  <Lock className="h-3.5 w-3.5 text-brand-orange" aria-label="Vote réservé aux membres" />
                </span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-brand-teal/15 bg-hero-wash p-8 text-center shadow-soft">
            <Lock className="mx-auto h-8 w-8 text-brand-teal" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-bold">Le vote est réservé aux membres</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Connectez-vous (ou créez votre compte avec le code d&apos;invitation) pour
              voter et voir les résultats en direct.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button className="h-11 rounded-full bg-brand-teal px-6 hover:bg-brand-teal/90" onClick={() => navigate("connexion")}>
                Se connecter
              </Button>
              <Button variant="outline" className="h-11 rounded-full border-brand-teal/40" onClick={() => navigate("inscription")}>
                Créer un compte
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Grille votable */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {poll.options.map((o) => {
              const active = selected.has(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => poll.pollOpen && toggle(o.id)}
                  disabled={!poll.pollOpen}
                  aria-pressed={active}
                  className={`relative flex items-start gap-3 rounded-2xl border-2 p-5 text-left transition ${
                    active
                      ? "border-brand-teal bg-brand-teal/10 shadow-lift"
                      : "border-brand-teal/10 bg-white hover:border-brand-teal/40 hover:shadow-soft"
                  } ${!poll.pollOpen ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <span className="text-2xl" aria-hidden>
                    {o.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug">{o.label}</span>
                    <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                      {o.description}
                    </span>
                  </span>
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-teal text-white shadow-soft"
                        aria-hidden
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* Barre d'action */}
          <div className="sticky bottom-4 z-10 mx-auto mt-8 flex max-w-2xl items-center justify-between gap-3 rounded-full border border-brand-teal/15 bg-white/95 px-4 py-3 shadow-lift backdrop-blur">
            <p className="pl-2 text-sm font-medium">
              {selected.size === 0
                ? "Aucune activité sélectionnée"
                : selected.size === 1
                  ? "1 activité sélectionnée"
                  : `${selected.size} activités sélectionnées`}
            </p>
            {poll.pollOpen ? (
              <Button
                onClick={save}
                disabled={saving}
                className="h-11 rounded-full bg-brand-teal px-6 font-semibold hover:bg-brand-teal/90"
              >
                {saving ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4.5 w-4.5" aria-hidden />
                )}
                {saving ? "Enregistrement…" : "Enregistrer mes votes"}
              </Button>
            ) : (
              <Badge variant="secondary" className="rounded-full">
                Sondage clôturé
              </Badge>
            )}
          </div>
          {dirty && poll.pollOpen && (
            <p className="mt-3 text-center text-sm text-brand-orange">
              Vous avez modifié votre sélection — pensez à enregistrer.
            </p>
          )}

          {/* Résultats */}
          {results.length > 0 && (
            <section className="mt-14" aria-labelledby="poll-results-title">
              <h2 id="poll-results-title" className="flex items-center gap-2 font-display text-2xl font-bold">
                <TrendingUp className="h-6 w-6 text-brand-teal" aria-hidden />
                Résultats en direct
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Classement des activités selon les votes des membres.
              </p>
              <ul className="mt-6 space-y-3">
                {results.map((r, i) => {
                  const mine = selected.has(r.id);
                  return (
                    <li key={r.id} className="rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-soft">
                      <div className="flex items-center justify-between gap-3">
                        <p className="flex min-w-0 items-center gap-2.5 font-medium">
                          <span className="text-xl" aria-hidden>
                            {r.emoji}
                          </span>
                          <span className="truncate">{r.label}</span>
                          {mine && (
                            <Badge className="ml-1 shrink-0 rounded-full bg-brand-teal/10 text-[11px] font-medium text-brand-deep">
                              <CheckCheck className="mr-1 h-3 w-3" aria-hidden />
                              mon choix
                            </Badge>
                          )}
                        </p>
                        <p className="shrink-0 text-sm font-bold text-brand-deep tabular-nums">
                          {r.count} vote{r.count > 1 ? "s" : ""}
                          <span className="ml-1 font-normal text-muted-foreground">· {r.pct}%</span>
                        </p>
                      </div>
                      <div
                        className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-brand-teal/8"
                        role="img"
                        aria-label={`${r.label} : ${r.count} votes, soit ${r.pct}% des votants`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            i === 0 && r.count > 0
                              ? "bg-orange-warm"
                              : "bg-teal-violet"
                          }`}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
