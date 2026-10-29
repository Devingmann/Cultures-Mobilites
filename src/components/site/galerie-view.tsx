"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Upload,
  Loader2,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Images,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import { UploadDialog } from "./upload-dialog";
import { formatDateFr, type FileDto } from "./types";

export function GalerieView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "PHOTO" | "CREATION">("ALL");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["files", "galerie"],
    queryFn: () => api<{ items: FileDto[] }>("/api/files"),
    enabled: Boolean(user),
  });

  const images = useMemo(
    () => (data?.items ?? []).filter((f) => f.kind === "IMAGE"),
    [data]
  );

  const shown = useMemo(
    () =>
      filter === "ALL"
        ? images
        : images.filter((f) => f.category === filter),
    [images, filter]
  );

  const current = lightbox !== null ? shown[lightbox] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && lightbox < shown.length - 1)
        setLightbox((i) => (i === null ? null : i + 1));
      if (e.key === "ArrowLeft" && lightbox > 0)
        setLightbox((i) => (i === null ? null : i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, shown.length]);

  const deleteCurrent = async () => {
    if (!current) return;
    const ok = window.confirm(`Supprimer « ${current.title} » de la galerie ?`);
    if (!ok) return;
    try {
      await api(`/api/files/${current.id}`, { method: "DELETE" });
      toast.success("Image supprimée.");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setLightbox(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange/10">
              <Camera className="h-6 w-6 text-brand-orange" aria-hidden />
            </span>
            Galerie des sorties
          </h1>
          <p className="mt-2 max-w-xl text-foreground/70">
            Les photos et créations réalisées pendant nos sorties — visibles par les
            membres connectés uniquement.
          </p>
        </div>
        <Button
          className="h-12 rounded-full bg-brand-orange px-6 font-semibold text-white hover:bg-brand-orange/90"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="mr-2 h-5 w-5" aria-hidden />
          Partager une image
        </Button>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrer la galerie">
        {[
          { key: "ALL", label: "Tout" },
          { key: "PHOTO", label: "📷 Photos de sortie" },
          { key: "CREATION", label: "🎨 Créations" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            aria-pressed={filter === f.key}
            className={`h-11 rounded-full px-5 text-sm font-medium transition ${
              filter === f.key
                ? "bg-brand-orange text-white shadow-soft"
                : "bg-white text-muted-foreground hover:bg-brand-orange/10 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-brand-teal/15 bg-brand-teal/5 px-4 py-3 text-sm text-brand-deep">
        <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden />
        <p>
          Droit à l&apos;image : chaque envoi demande votre accord. Si une personne
          souhaite retirer une photo, contactez un animateur — elle sera supprimée
          sans discussion.
        </p>
      </div>

      {/* Mur d'images */}
      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand-orange" aria-label="Chargement de la galerie" />
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-brand-orange/30 bg-hero-wash p-12 text-center">
          <Images className="mx-auto h-10 w-10 text-brand-orange/70" aria-hidden />
          <h2 className="mt-4 font-display text-xl font-bold">
            {images.length === 0 ? "Pas encore de photos" : "Aucune image dans cette catégorie"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Les Jardins de la Fontaine, le musée de la Romanité, l&apos;atelier
            collage… il y en a, des souvenirs à partager !
          </p>
          <Button
            className="mt-6 h-11 rounded-full bg-brand-orange px-6 text-white hover:bg-brand-orange/90"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="mr-2 h-4.5 w-4.5" aria-hidden />
            Ajouter des photos
          </Button>
        </div>
      ) : (
        <div className="columns-2 gap-4 py-8 md:columns-3 xl:columns-4 [&>*]:mb-4">
          {shown.map((f, i) => (
            <figure
              key={f.id}
              className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-soft transition hover:shadow-lift"
            >
              <button
                onClick={() => setLightbox(i)}
                className="block w-full"
                aria-label={`Agrandir ${f.title || f.originalName}`}
              >
                <Image
                  src={`/api/files/${f.id}/raw`}
                  alt={f.title || f.originalName}
                  width={600}
                  height={600}
                  className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  unoptimized
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/70 to-transparent p-3.5 pt-8 text-left opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="truncate text-sm font-semibold text-white">
                    {f.title || f.originalName}
                  </p>
                  <p className="mt-0.5 text-xs text-white/80">
                    {f.uploader.name} · {formatDateFr(f.createdAt)}
                  </p>
                </figcaption>
              </button>
            </figure>
          ))}
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultCategory="PHOTO"
      />

      {/* Lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo : ${current.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>

          <button
            aria-label="Photo précédente"
            disabled={lightbox === 0}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => (i === null ? null : Math.max(0, i - 1)));
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <figure
            className="flex max-h-full max-w-4xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[75vh] overflow-hidden rounded-2xl">
              <Image
                src={`/api/files/${current.id}/raw`}
                alt={current.title || current.originalName}
                width={1400}
                height={1400}
                className="h-auto max-h-[75vh] w-auto object-contain"
                unoptimized
                priority
              />
            </div>
            <figcaption className="flex w-full flex-wrap items-center justify-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur">
              <span className="min-w-0 flex-1 text-center text-sm">
                <strong className="font-semibold">{current.title || current.originalName}</strong>
                <span className="ml-2 text-white/75">
                  {current.uploader.name} · {formatDateFr(current.createdAt)}
                </span>
              </span>
              <Button
                asChild
                variant="secondary"
                className="h-10 rounded-full bg-white/15 px-4 text-white hover:bg-white/25"
              >
                <a href={`/api/files/${current.id}/raw?dl=1`}>
                  <Download className="mr-1.5 h-4 w-4" aria-hidden />
                  Télécharger
                </a>
              </Button>
              {(current.isMine || user?.role === "ADMIN") && (
                <Button
                  variant="ghost"
                  className="h-10 rounded-full bg-destructive/20 px-4 text-white hover:bg-destructive/40 hover:text-white"
                  onClick={deleteCurrent}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                  Supprimer
                </Button>
              )}
            </figcaption>
          </figure>

          <button
            aria-label="Photo suivante"
            disabled={lightbox === shown.length - 1}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) =>
                i === null || i >= shown.length - 1 ? i : i + 1
              );
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
