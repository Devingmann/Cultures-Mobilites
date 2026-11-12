"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Newspaper,
  Vote,
  Images,
  FolderOpen,
  Camera,
  Users,
  Bus,
  Landmark,
  Sparkles,
  Heart,
  Mic,
  Lock,
  CalendarDays,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import { formatDateFr, type PollDto, type PostDto } from "./types";
import { PROCHAINE } from "./sorties-data"; // peut être undefined

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export function HomeView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  // PROCHAINE peut être undefined si aucune sortie n'est marquée « prochaine »
  const prochaine = PROCHAINE;

  const { data: poll } = useQuery({
    queryKey: ["poll"],
    queryFn: () => api<PollDto>("/api/poll"),
  });

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api<{ items: PostDto[] }>("/api/posts"),
  });

  const latest = (posts?.items ?? []).slice(0, 3);

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-hero-wash">
        <div
          aria-hidden
          className="animate-blob absolute -left-24 -top-24 h-80 w-80 bg-brand-teal/15 blur-2xl"
        />
        <div
          aria-hidden
          className="animate-blob absolute -bottom-32 right-4 h-96 w-96 bg-brand-violet/15 blur-2xl"
          style={{ animationDelay: "-7s" }}
        />
        <div
          aria-hidden
          className="animate-blob absolute right-1/3 top-10 h-24 w-24 bg-brand-orange/15 blur-xl"
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <Badge className="rounded-full border-brand-teal/25 bg-white/70 px-4 py-1.5 text-xs font-medium text-brand-deep shadow-soft">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand-orange" aria-hidden />
              Projet transversal · APIJE Mobilité · IFAD · Parcours Santé Mieux Être
            </Badge>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Cultures <span className="text-gradient">et</span>{" "}
              Mobilités
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
              Photos, retours de sorties et avis : le site du groupe pour garder une trace
              de nos sorties culturelles, partager nos découvertes et choisir ensemble
              la prochaine destination.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-12 rounded-full bg-brand-teal px-7 text-[15px] font-semibold text-white shadow-lift hover:bg-brand-teal/90"
                onClick={() => navigate("sondage")}
              >
                <Vote className="mr-2 h-5 w-5" aria-hidden />
                Voter au sondage
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-brand-teal/40 bg-white/60 px-7 text-[15px] font-semibold hover:bg-white"
                onClick={() => navigate("journal")}
              >
                <Newspaper className="mr-2 h-5 w-5 text-brand-violet" aria-hidden />
                Lire le journal
              </Button>
            </div>
            {!user && (
              <p className="mt-4 text-sm text-muted-foreground">
                <button
                  onClick={() => navigate("inscription")}
                  className="font-semibold text-brand-teal underline-offset-4 hover:underline"
                >
                  Rejoignez le groupe
                </button>{" "}
                avec le code d&apos;invitation partagé par les animateurs.
              </p>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="animate-floaty relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/70 p-6 shadow-lift backdrop-blur-sm">
                <Image
                  src="/images/logo-badge.png"
                  alt="Logo du groupe Cultures et Mobilités : masque de théâtre, palette, musée, objectif photo, globe et flèche"
                  width={420}
                  height={420}
                  className="mx-auto h-auto w-full max-w-[340px]"
                  priority
                />
              </div>
              <div className="absolute -left-4 top-8 hidden rounded-2xl border border-brand-teal/15 bg-white px-4 py-2.5 shadow-soft sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-deep">
                  <Vote className="h-4 w-4 text-brand-teal" aria-hidden />
                  On décide ensemble
                </p>
              </div>
              <div className="absolute -bottom-4 -right-2 hidden rounded-2xl border border-brand-orange/20 bg-white px-4 py-2.5 shadow-soft sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
                  <Camera className="h-4 w-4" aria-hidden />
                  On garde une trace
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- LES ESPACES ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Un espace pour chaque envie
          </h2>
          <p className="mt-3 text-foreground/70">
            Chacun participe selon ses facilités : à l&apos;écrit, à l&apos;oral, en
            photos ou en création. Il y a une place pour tous les talents.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Map,
              title: "Sorties & lieux",
              text: "Calendrier prévisionnel (déc. 2026 – juin 2027), fiches des lieux à proposer et nos sorties réalisées.",
              action: "Voir les sorties",
              path: "sorties",
              color: "text-white",
              bg: "bg-orange-warm",
              open: true,
            },
            {
              icon: Newspaper,
              title: "Journal du groupe",
              text: "Articles, récits, photos et capsules audio : la mémoire vivante de nos sorties.",
              action: "Lire le journal",
              path: "journal",
              color: "text-brand-violet",
              bg: "bg-brand-violet/10",
              open: true,
            },
            {
              icon: Vote,
              title: "Sondage participatif",
              text: "Plusieurs choix possibles, résultats en direct : la prochaine sortie se décide ensemble.",
              action: "Voir le sondage",
              path: "sondage",
              color: "text-brand-teal",
              bg: "bg-brand-teal/10",
              open: true,
            },
            {
              icon: Images,
              title: "Galerie photo",
              text: "Les photos et créations des sorties, en consultation libre pour les membres.",
              action: user ? "Ouvrir la galerie" : "Espace membres",
              path: "galerie",
              color: "text-brand-orange",
              bg: "bg-brand-orange/10",
              open: Boolean(user),
            },
            {
              icon: FolderOpen,
              title: "Drive partagé",
              text: "L'espace de stockage commun : photos, vidéos, documents de toute sorte.",
              action: user ? "Ouvrir le drive" : "Espace membres",
              path: "drive",
              color: "text-brand-deep",
              bg: "bg-brand-teal/15",
              open: Boolean(user),
            },
          ].map((card, i) => (
            <motion.button
              key={card.path}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07 }}
              onClick={() => navigate(card.path)}
              className="group flex flex-col rounded-3xl border border-brand-teal/10 bg-white p-6 text-left shadow-soft transition hover:-translate-y-1 hover:border-brand-teal/30 hover:shadow-lift"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.text}
              </p>
              <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-teal">
                {card.action}
                {!card.open && <Lock className="h-3.5 w-3.5 text-brand-orange" aria-hidden />}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ---------------- LE PROJET ---------------- */}
      <section className="border-y border-brand-teal/10 bg-[#f9f6f0]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              La culture comme chemin, la mobilité comme ouverture
            </h2>
            <p className="mt-4 leading-relaxed text-foreground/75">
              « Culture et mobilité » est un projet transversal qui réunit trois
              dispositifs d&apos;accompagnement. Après la sortie à Nîmes et la visite
              du musée de la Romanité, le groupe a souhaité un outil pour garder une
              trace des sorties, croiser les regards et mutualiser les compétences.
            </p>
            <p className="mt-3 leading-relaxed text-foreground/75">
              L&apos;objectif commun reste l&apos;accès à la culture : explorer, partager
              des ressentis, et préparer ensemble les prochaines sorties — en laissant à
              chacun une place pour s&apos;exprimer selon ses envies.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Landmark, text: "Sorties culturelles : musées, expos, théâtre, cinéma…" },
                { icon: Bus, text: "Mobilité accompagnée : se déplacer ensemble, en confiance" },
                { icon: Users, text: "Groupe : entraide, écoute et place pour chacun" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-soft">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
                  <span className="text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] border-4 border-white shadow-lift">
              <Image
                src="/images/hero-wide.png"
                alt="Illustration : un groupe se promène entre un musée, un théâtre, un cinéma et un jardin, avec bus et vélos"
                width={1344}
                height={768}
                className="h-auto w-full"
              />
            </div>
            <div className="absolute -bottom-5 left-6 rounded-2xl bg-white px-4 py-2.5 shadow-lift">
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-deep">
                <Heart className="h-4 w-4 fill-brand-orange text-brand-orange" aria-hidden />
                Un projet d&apos;accompagnement collectif
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- COMMENT PARTICIPER ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Comment participer ?
          </h2>
          <p className="mt-3 text-foreground/70">
            Quatre petits pas pour rejoindre l&apos;aventure — et aucune compétence
            particulière n&apos;est requise.
          </p>
        </motion.div>

        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            {
              n: "1",
              icon: Users,
              title: "Créez votre compte",
              text: "Avec le code d'invitation du groupe, en deux minutes.",
            },
            {
              n: "2",
              icon: Camera,
              title: "Partagez vos photos",
              text: "Déposez-les dans le drive : la galerie s'illumine toute seule.",
            },
            {
              n: "3",
              icon: Vote,
              title: "Donnez votre avis",
              text: "Votez pour les activités qui vous tentent le plus.",
            },
            {
              n: "4",
              icon: Mic,
              title: "Écrivez ou enregistrez",
              text: "Un récit, une photo commentée, une capsule audio : comme vous voulez.",
            },
          ].map((step, i) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-soft"
            >
              <span
                aria-hidden
                className="absolute -top-3 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-orange-warm font-display text-sm font-bold text-white shadow-soft"
              >
                {step.n}
              </span>
              <step.icon className="h-6 w-6 text-brand-teal" aria-hidden />
              <h3 className="mt-3 font-display text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-brand-teal/15 bg-hero-wash p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-foreground/80">
            <strong className="font-display">Respect de chacun :</strong> les photos et
            créations sont réservées aux membres connectés, et le droit à l&apos;image
            est demandé à chaque envoi.
          </p>
          {!user ? (
            <Button
              className="h-11 shrink-0 rounded-full bg-brand-teal px-6 hover:bg-brand-teal/90"
              onClick={() => navigate("inscription")}
            >
              Créer mon compte
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button
              className="h-11 shrink-0 rounded-full bg-brand-teal px-6 hover:bg-brand-teal/90"
              onClick={() => navigate("espace")}
            >
              Mon espace
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </section>

      {/* ---------------- CALENDRIER / SORTIES ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <motion.div
          {...fadeUp}
          className="overflow-hidden rounded-[2rem] bg-teal-violet text-white shadow-lift"
        >
          <div className="grid items-center md:grid-cols-5">
            <div className="p-8 sm:p-10 md:col-span-3">
              <Badge className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Calendrier prévisionnel · Déc. 2026 – Juin 2027
              </Badge>
              <h2 className="mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">
                Sorties culturelles & ateliers intermédiaires
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                Retrouvez les dates des rendez-vous du groupe. N&apos;hésitez pas à
                échanger sur Telegram pour proposer vos idées, vos envies ou des
                articles de sorties dans les alentours et les villes voisines.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-white px-6 text-[15px] font-semibold text-brand-deep hover:bg-white/90"
                  onClick={() => navigate("sorties")}
                >
                  <Map className="mr-2 h-5 w-5" aria-hidden />
                  Voir le calendrier
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/40 bg-transparent px-6 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white"
                  onClick={() => navigate("sondage")}
                >
                  <Vote className="mr-2 h-5 w-5" aria-hidden />
                  {poll?.pollOpen ? "Le sondage continue" : "Voir le sondage"}
                </Button>
              </div>
            </div>
            <div className="relative min-h-44 md:col-span-2">
              <Image
                src="/images/hero-wide.png"
                alt="Illustration des sorties culturelles du groupe"
                width={1344}
                height={768}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- DERNIÈRES NOUVELLES ---------------- */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <motion.div {...fadeUp} className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Dernières nouvelles
              </h2>
              <p className="mt-2 text-foreground/70">
                Le journal de notre groupe, écrit par celles et ceux qui le font vivre.
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden h-11 rounded-full border-brand-teal/40 sm:inline-flex"
              onClick={() => navigate("journal")}
            >
              Tout le journal
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </motion.div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post, i) => (
              <motion.button
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`journal/${post.slug}`)}
                className="group overflow-hidden rounded-3xl border border-brand-teal/10 bg-white text-left shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                {post.coverName ? (
                  <Image
                    src={`/covers/${post.coverName}`}
                    alt={`Couverture de l'article ${post.title}`}
                    width={640}
                    height={360}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <Image
                    src="/images/journal-art.png"
                    alt="Illustration du journal de groupe"
                    width={512}
                    height={512}
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDateFr(post.createdAt)} · {post.author.name}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-brand-deep">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="outline"
              className="h-11 rounded-full border-brand-teal/40"
              onClick={() => navigate("journal")}
            >
              Tout le journal
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
