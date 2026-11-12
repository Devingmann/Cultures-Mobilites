"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Map,
  CalendarDays,
  Clock,
  Bus,
  Ticket,
  MapPin,
  ExternalLink,
  Vote,
  ArrowRight,
  Footprints,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  mapsUrl,
  PROCHAINE,
  PROPOSITIONS,
  REALISEES,
  CALENDRIER,
  type Sortie,
  type RendezVous,
} from "./sorties-data";

function StatutBadge({ s }: { s: Sortie }) {
  if (s.statut === "prochaine") {
    return (
      <Badge className="rounded-full border-0 bg-orange-warm px-3.5 py-1.5 text-xs font-bold text-white shadow-soft">
        <CalendarDays className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        {s.date}
      </Badge>
    );
  }
  if (s.statut === "realisee") {
    return (
      <Badge className="rounded-full border-0 bg-brand-teal/10 px-3.5 py-1.5 text-xs font-semibold text-brand-deep">
        <Footprints className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        {s.statutLabel} · {s.date}
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full border-0 bg-brand-violet/10 px-3.5 py-1.5 text-xs font-semibold text-brand-violet">
      {s.statutLabel}
    </Badge>
  );
}

function InfoRows({ s }: { s: Sortie }) {
  return (
    <ul className="space-y-1.5 text-sm">
      <li className="flex items-start gap-2.5">
        <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden />
        <span>
          <span className="font-semibold">Tarif :</span> {s.tarif}
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" aria-hidden />
        <span>
          <span className="font-semibold">Horaires :</span> {s.horaires}
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <Bus className="mt-0.5 h-4 w-4 shrink-0 text-brand-violet" aria-hidden />
        <span>
          <span className="font-semibold">Mobilité APIJE :</span> {s.mobilite}
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-deep" aria-hidden />
        <span className="text-muted-foreground">{s.adresse}</span>
      </li>
    </ul>
  );
}

function MapsButton({ s }: { s: Sortie }) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-11 rounded-full border-brand-teal/40 px-5 text-sm font-medium hover:bg-brand-teal/5"
    >
      <a href={mapsUrl(s)} target="_blank" rel="noopener noreferrer">
        <Map className="mr-2 h-4 w-4 text-brand-teal" aria-hidden />
        Vue Google Maps
        <ExternalLink className="ml-1.5 h-3 w-3 text-muted-foreground" aria-hidden />
      </a>
    </Button>
  );
}

function CalendrierTable() {
  let lastMois = "";
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-teal/15 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="bg-brand-deep text-white">
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Rendez-vous</th>
              <th className="px-4 py-3 font-semibold">Lieu / précision</th>
            </tr>
          </thead>
          <tbody>
            {CALENDRIER.map((rdv, i) => {
              const showMois = rdv.mois !== lastMois;
              lastMois = rdv.mois;
              return (
                <>
                  {showMois && (
                    <tr key={`mois-${rdv.mois}`} className="bg-brand-teal/8">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-deep"
                      >
                        {rdv.mois}
                      </td>
                    </tr>
                  )}
                  <tr
                    key={`${rdv.date}-${i}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-hero-wash/60"}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{rdv.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          rdv.type === "sortie"
                            ? "font-semibold text-brand-orange"
                            : "font-semibold text-brand-violet"
                        }
                      >
                        {rdv.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rdv.lieu ? (
                        <>
                          {rdv.lieu}
                          {rdv.aConfirmer && (
                            <span className="ml-1 text-brand-orange">?</span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-brand-orange/20 bg-orange-warm/10 px-4 py-3 text-xs text-foreground/80">
        <strong className="font-semibold text-brand-orange">À noter :</strong> les lieux
        indiqués avec un point d&apos;interrogation restent à confirmer.
      </p>
    </div>
  );
}

export function SortiesView({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* En-tête */}
      <div className="max-w-2xl">
        <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-warm">
            <Map className="h-6 w-6 text-white" aria-hidden />
          </span>
          Sorties & lieux à découvrir
        </h1>
        <p className="mt-3 leading-relaxed text-foreground/70">
          Calendrier prévisionnel des sorties culturelles et ateliers intermédiaires,
          fiches des lieux à proposer au vote, et celles déjà vécues ensemble.
        </p>
      </div>

      {/* Calendrier prévisionnel */}
      <section aria-labelledby="calendrier" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="calendrier" className="font-display text-xl font-bold">
              Calendrier des rendez-vous
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Décembre 2026 – Juin 2027 · Groupe « Culture et mobilité »
            </p>
          </div>
          <Badge className="rounded-full border-0 bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-deep">
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Prévisionnel
          </Badge>
        </div>

        <div className="mt-5">
          <CalendrierTable />
        </div>

        {/* Appel Telegram */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 flex flex-col gap-4 rounded-3xl border border-brand-violet/20 bg-brand-violet/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-violet text-white">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-brand-deep">
                Proposez vos idées sur Telegram
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                N&apos;hésitez pas à échanger pour donner vos idées, vos envies, ou
                partager des articles de sorties dans les alentours ou les villes
                voisines proches. On construit le programme ensemble.
              </p>
            </div>
          </div>
          <Button
            className="h-11 shrink-0 rounded-full bg-brand-violet px-5 text-sm font-semibold hover:bg-brand-violet/90"
            onClick={() => navigate("sondage")}
          >
            <Vote className="mr-1.5 h-4 w-4" aria-hidden />
            Voir le sondage
          </Button>
        </motion.div>
      </section>

      {/* Prochaine sortie (si définie) */}
      {PROCHAINE && (
        <section aria-labelledby="prochaine-sortie" className="mt-14">
          <h2 id="prochaine-sortie" className="font-display text-xl font-bold">
            Prochaine sortie
          </h2>
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 overflow-hidden rounded-[2rem] border border-brand-orange/20 bg-white shadow-lift"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-56">
                <Image
                  src={PROCHAINE.illustration ?? "/images/hero-wide.png"}
                  alt={`Illustration : ${PROCHAINE.nom}, ${PROCHAINE.lieu}`}
                  width={1344}
                  height={768}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4">
                  <StatutBadge s={PROCHAINE} />
                </div>
              </div>
              <div className="flex flex-col p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                  {PROCHAINE.statutLabel} · {PROCHAINE.periode}
                </p>
                <h3 className="mt-1.5 font-display text-2xl font-extrabold leading-snug">
                  {PROCHAINE.nom}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand-deep">{PROCHAINE.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {PROCHAINE.paragraphs[0]}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {PROCHAINE.paragraphs[1]}
                </p>
                <div className="mt-5">
                  <InfoRows s={PROCHAINE} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3 pt-1">
                  <MapsButton s={PROCHAINE} />
                  <Button
                    className="h-11 rounded-full bg-brand-orange px-5 text-sm font-semibold text-white hover:bg-brand-orange/90"
                    onClick={() => navigate("journal")}
                  >
                    Lire l&apos;annonce
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>
        </section>
      )}

      {/* Lieux à proposer */}
      <section aria-labelledby="a-proposer" className="mt-14">
        <h2 id="a-proposer" className="font-display text-xl font-bold">
          Lieux à proposer au groupe
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ces sorties sont à l&apos;étude : votez pour celles qui vous tentent le
          plus, plusieurs choix possibles. Partagez aussi vos envies sur Telegram.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PROPOSITIONS.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: Math.min(i * 0.05, 0.25) }}
              className="flex flex-col rounded-3xl border border-brand-violet/15 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <StatutBadge s={s} />
              <h3 className="mt-3 font-display text-lg font-bold leading-snug">{s.nom}</h3>
              <p className="mt-0.5 text-sm font-medium text-brand-deep">{s.tagline}</p>
              {s.periode && (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-violet">
                  {s.periode}
                </p>
              )}
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {s.paragraphs[0]} {s.paragraphs[1]}
              </p>
              <div className="mt-4 border-t border-brand-violet/10 pt-4">
                <InfoRows s={s} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button
                  className="h-11 flex-1 rounded-full bg-brand-violet px-4 text-sm font-semibold hover:bg-brand-violet/90"
                  onClick={() => navigate("sondage")}
                >
                  <Vote className="mr-1.5 h-4 w-4" aria-hidden />
                  Voter au sondage
                </Button>
                <MapsButton s={s} />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Sorties réalisées */}
      {REALISEES.length > 0 && (
        <section aria-labelledby="realisees" className="mt-14">
          <h2 id="realisees" className="font-display text-xl font-bold">
            Nos sorties réalisées
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            La mémoire des temps passés ensemble — photos et témoignages dans le
            journal et la galerie.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {REALISEES.map((s) => (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                className="flex flex-col rounded-3xl border border-brand-teal/15 bg-hero-wash p-6 shadow-soft"
              >
                <StatutBadge s={s} />
                <h3 className="mt-3 font-display text-lg font-bold leading-snug">{s.nom}</h3>
                <p className="mt-0.5 text-sm font-medium text-brand-deep">{s.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/75">
                  {s.paragraphs[0]} {s.paragraphs[1]}
                </p>
                <div className="mt-4">
                  <InfoRows s={s} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button
                    className="h-11 rounded-full bg-brand-teal px-5 text-sm font-semibold hover:bg-brand-teal/90"
                    onClick={() => navigate("journal")}
                  >
                    Relire le compte rendu
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Button>
                  <MapsButton s={s} />
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
