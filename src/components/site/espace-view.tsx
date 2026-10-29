"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FolderOpen,
  Vote,
  PenLine,
  Images,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import type { FileDto, FilesResponse, PollDto, PostDto } from "./types";

export function EspaceView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  const { data: files } = useQuery({
    queryKey: ["files", "espace"],
    queryFn: () => api<FilesResponse>("/api/files"),
  });
  const { data: poll } = useQuery({
    queryKey: ["poll"],
    queryFn: () => api<PollDto>("/api/poll"),
  });
  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api<{ items: PostDto[] }>("/api/posts"),
  });

  if (!user) return null;

  const myFiles = (files?.items ?? []).filter((f: FileDto) => f.isMine).length;
  const myPosts = (posts?.items ?? []).filter((p) => p.author.id === user.id).length;
  const myVotes = poll?.myVotes?.length ?? 0;

  const stats = [
    { icon: FolderOpen, label: "Mes fichiers dans le drive", value: myFiles, path: "drive", color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { icon: Vote, label: "Mes choix au sondage", value: myVotes, path: "sondage", color: "text-brand-orange", bg: "bg-brand-orange/10" },
    { icon: PenLine, label: "Mes articles du journal", value: myPosts, path: "journal", color: "text-brand-violet", bg: "bg-brand-violet/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-teal/10">
          <LayoutDashboard className="h-6 w-6 text-brand-teal" aria-hidden />
        </span>
        Bonjour {user.name.split(" ")[0]} !
      </h1>
      <p className="mt-2 text-foreground/70">
        Votre tableau de bord pour participer au groupe « Culture et mobilité ».
      </p>

      {/* Statistiques */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <button
            key={s.path}
            onClick={() => navigate(s.path)}
            className="flex items-center gap-4 rounded-3xl border border-brand-teal/10 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} aria-hidden />
            </span>
            <span>
              <span className="block font-display text-2xl font-extrabold">{s.value}</span>
              <span className="block text-xs leading-snug text-muted-foreground">{s.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Prochaine étape */}
      <div className="mt-8 overflow-hidden rounded-3xl bg-teal-violet p-7 text-white shadow-lift">
        <Badge className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Prochaine sortie · jeudi 12 novembre
        </Badge>
        <h2 className="mt-3 font-display text-2xl font-bold">
          Centre d&apos;Art La Fenêtre — Montpellier, place de la Comédie
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
          Architecture, design graphique et espace urbain — entrée 100 % libre.
          Leslie Vorstermans précise les créneaux horaires. Le debrief se fera
          en terrasse de la Comédie, et le sondage continue pour préparer les
          propositions suivantes.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            className="h-11 rounded-full bg-white px-6 font-semibold text-brand-deep hover:bg-white/90"
            onClick={() => navigate("sorties")}
          >
            <Images className="mr-2 h-4.5 w-4.5" aria-hidden />
            Voir la fiche de la sortie
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            onClick={() => navigate("journal")}
          >
            <PenLine className="mr-2 h-4.5 w-4.5" aria-hidden />
            Alimenter le journal
          </Button>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: FolderOpen, title: "Drive", text: "Déposer photos, capsules, documents", path: "drive" },
          { icon: Images, title: "Galerie", text: "Voir les photos des sorties", path: "galerie" },
          { icon: Vote, title: "Sondage", text: "Voter pour la prochaine sortie", path: "sondage" },
          { icon: PenLine, title: "Journal", text: "Lire ou écrire un article", path: "journal" },
        ].map((a) => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            className="group flex flex-col rounded-3xl border border-brand-teal/10 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand-teal/30 hover:shadow-lift"
          >
            <a.icon className="h-6 w-6 text-brand-teal" aria-hidden />
            <h3 className="mt-3 font-display text-base font-semibold">
              {a.title}
              <ArrowRight className="ml-1.5 inline h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </h3>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">{a.text}</p>
          </button>
        ))}
      </div>

      {/* Rappel droit à l'image */}
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-brand-teal/15 bg-brand-teal/5 p-5 text-sm leading-relaxed text-brand-deep">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          <strong>Bon réflexe :</strong> avant d&apos;envoyer une photo, vérifiez que
          les personnes visibles sont d&apos;accord pour le partage au sein du groupe.
          En cas de doute, demandez — ou envoyez la photo sans visages. Les animateurs
          peuvent retirer une image sur simple demande.
        </p>
      </div>
    </div>
  );
}
