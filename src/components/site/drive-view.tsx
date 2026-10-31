"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Search,
  FolderOpen,
  FileText,
  Film,
  Music,
  File as FileIcon,
  ImageIcon,
  Download,
  Trash2,
  Loader2,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import { UploadDialog } from "./upload-dialog";
import { CATEGORIES, formatDateShort, type FileDto, type FilesResponse } from "./types";

const KIND_FILTERS = [
  { key: "", label: "Tous" },
  { key: "IMAGE", label: "Images" },
  { key: "VIDEO", label: "Vidéo" },
  { key: "AUDIO", label: "Audio" },
  { key: "PDF", label: "PDF" },
];

function KindIcon({ kind }: { kind: FileDto["kind"] }) {
  const cls = "h-6 w-6";
  switch (kind) {
    case "IMAGE":
      return <ImageIcon className={`${cls} text-brand-teal`} aria-hidden />;
    case "VIDEO":
      return <Film className={`${cls} text-brand-violet`} aria-hidden />;
    case "AUDIO":
      return <Music className={`${cls} text-brand-orange`} aria-hidden />;
    case "PDF":
      return <FileText className={`${cls} text-brand-deep`} aria-hidden />;
    default:
      return <FileIcon className={`${cls} text-muted-foreground`} aria-hidden />;
  }
}

export function DriveView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [kind, setKind] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FileDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["files", q, category, kind],
    queryFn: () =>
      api<FilesResponse>(
        `/api/files?${new URLSearchParams({
          ...(q ? { q } : {}),
          ...(category !== "all" ? { category } : {}),
          ...(kind ? { kind } : {}),
        }).toString()}`
      ),
    enabled: Boolean(user),
  });

  const items = useMemo(() => data?.items ?? [], [data]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api(`/api/files/${toDelete.id}`, { method: "DELETE" });
      toast.success("Fichier supprimé du drive.");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-teal/10">
              <FolderOpen className="h-6 w-6 text-brand-teal" aria-hidden />
            </span>
            Drive du groupe
          </h1>
          <p className="mt-2 max-w-xl text-foreground/70">
            L&apos;espace de stockage commun : photos des sorties, créations, capsules
            audio et documents de toute sorte.
          </p>
        </div>
        <Button
          className="h-12 rounded-full bg-brand-teal px-6 font-semibold hover:bg-brand-teal/90"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="mr-2 h-5 w-5" aria-hidden />
          Ajouter des fichiers
        </Button>
      </div>

      {/* Barre d'outils */}
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-teal/10 bg-white p-3 shadow-soft">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un fichier…"
            className="h-11 rounded-xl pl-10"
            aria-label="Rechercher dans le drive"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11 w-52 rounded-xl" aria-label="Filtrer par catégorie">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(CATEGORIES).map(([key, meta]) => (
              <SelectItem key={key} value={key}>
                {meta.emoji} {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par type">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.key || "all"}
              onClick={() => setKind(f.key)}
              aria-pressed={kind === f.key}
              className={`h-11 rounded-full px-4 text-sm font-medium transition ${
                kind === f.key
                  ? "bg-brand-teal text-white"
                  : "bg-muted text-muted-foreground hover:bg-brand-teal/10 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {data && (
        <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{data.total}</strong> fichier
            {data.total > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HardDrive className="h-4 w-4 text-brand-teal" aria-hidden />
            {data.totalSizeLabel} partagés
          </span>
          {user?.role === "ADMIN" && (
            <Badge className="rounded-full bg-brand-violet/10 text-[11px] font-medium text-brand-violet">
              Vue administrateur — suppression autorisée
            </Badge>
          )}
        </p>
      )}

      {/* Grille */}
      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand-teal" aria-label="Chargement du drive" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-brand-teal/25 bg-hero-wash p-12 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-brand-teal/60" aria-hidden />
          <h2 className="mt-4 font-display text-xl font-bold">Le drive est encore vide</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Déposez les photos de la sortie à Nîmes, vos créations de l&apos;atelier
            collage, ou vos capsules audio de témoignage.
          </p>
          <Button
            className="mt-6 h-11 rounded-full bg-brand-teal px-6 hover:bg-brand-teal/90"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="mr-2 h-4.5 w-4.5" aria-hidden />
            Déposer mes premiers fichiers
          </Button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((f) => (
            <li
              key={f.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-teal/5 to-brand-violet/10">
                {f.kind === "IMAGE" ? (
  <Image
    src={f.url}
    alt={f.title || f.originalName}
    width={400}
    height={300}
    className="h-full w-full object-cover"
    unoptimized
  />
) : (
  <KindIcon kind={f.kind} />
)}
                <Badge className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 text-[11px] font-medium text-foreground/80 shadow-soft">
                  {f.categoryEmoji} {f.categoryLabel}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="truncate font-semibold" title={f.title}>
                  {f.title || f.originalName}
                </p>
                <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-snug text-muted-foreground">
                  {f.description || f.originalName}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {f.sizeLabel} · {formatDateShort(f.createdAt)} · {f.uploader.name}
                  {f.isMine && <span className="ml-1 font-semibold text-brand-teal">(vous)</span>}
                </p>
                <div className="mt-3 flex items-center gap-1.5 pt-1">
                  <Button
                    asChild
                    variant="secondary"
                    className="h-9 flex-1 rounded-full bg-muted text-xs font-medium hover:bg-brand-teal/10"
                  >
                    <a
  href={f.downloadUrl}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`Télécharger ${f.title || f.originalName}`}
>
                      <Download className="mr-1 h-3.5 w-3.5" aria-hidden />
                      Télécharger
                    </a>
                  </Button>
                  {(f.isMine || user?.role === "ADMIN") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setToDelete(f)}
                      aria-label={`Supprimer ${f.title || f.originalName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Confirmation suppression */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Supprimer ce fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{toDelete?.title || toDelete?.originalName}&nbsp;» sera retiré du
              drive du groupe. Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-full px-5">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-11 rounded-full bg-destructive px-5 hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
