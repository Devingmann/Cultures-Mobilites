"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Newspaper,
  PenLine,
  Loader2,
  Upload,
  Mic,
  Lock,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import { formatDateFr, type FileDto, type PostDto } from "./types";

const KIND_META: Record<string, { label: string; cls: string }> = {
  ARTICLE: { label: "Article", cls: "bg-brand-violet/10 text-brand-violet" },
  PHOTO: { label: "Retour en photos", cls: "bg-brand-orange/10 text-brand-orange" },
  CAPSULE: { label: "Capsule audio / vidéo", cls: "bg-brand-teal/10 text-brand-teal" },
};

function PostCard({
  post,
  navigate,
  featured = false,
}: {
  post: PostDto;
  navigate: (path: string) => void;
  featured?: boolean;
}) {
  const kind = KIND_META[post.kind] ?? KIND_META.ARTICLE;
  return (
    <button
      onClick={() => navigate(`journal/${post.slug}`)}
      className={`group overflow-hidden rounded-3xl border border-brand-teal/10 bg-white text-left shadow-soft transition hover:-translate-y-1 hover:shadow-lift ${
        featured ? "md:grid md:grid-cols-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "h-64 md:h-full" : "h-44"}`}>
        <Image
          src={post.coverName ? `/covers/${post.coverName}` : "/images/journal-art.png"}
          alt={`Illustration de l'article ${post.title}`}
          width={featured ? 800 : 640}
          height={featured ? 600 : 360}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className={`p-6 ${featured ? "md:flex md:flex-col md:justify-center" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`rounded-full border-0 ${kind.cls} font-medium`}>{kind.label}</Badge>
          {post.hasMedia && (
            <Badge className="rounded-full border-0 bg-muted font-medium text-muted-foreground">
              <Mic className="mr-1 h-3 w-3" aria-hidden /> capsule
            </Badge>
          )}
        </div>
        <h3
          className={`mt-3 font-display font-bold leading-snug transition group-hover:text-brand-deep ${
            featured ? "text-2xl" : "text-lg"
          }`}
        >
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          {formatDateFr(post.createdAt)} · {post.author.name}
        </p>
      </div>
    </button>
  );
}

export type EditorInitial = {
  slug: string;
  title: string;
  content: string;
  kind: string;
  coverName: string | null;
  mediaFileId: string | null;
};

export function EditorDialog({
  open,
  onOpenChange,
  navigate,
  initial = null,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  navigate: (path: string) => void;
  initial?: EditorInitial | null;
}) {
  const queryClient = useQueryClient();
  const editing = Boolean(initial?.slug);
  const { data: myFiles } = useQuery({
    queryKey: ["files", "mine-for-editor"],
    queryFn: () => api<{ items: FileDto[] }>("/api/files"),
    enabled: open,
  });
  const capsules = useMemo(
    () => (myFiles?.items ?? []).filter((f) => f.kind === "AUDIO" || f.kind === "VIDEO"),
    [myFiles]
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [kind, setKind] = useState("ARTICLE");
  const [mediaFileId, setMediaFileId] = useState<string>("none");
  const [cover, setCover] = useState<{ name: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // préremplissage en mode modification
  useEffect(() => {
    if (open && initial) {
      setTitle(initial.title);
      setContent(initial.content);
      setKind(initial.kind);
      setMediaFileId(initial.mediaFileId ?? "none");
      setCover(
        initial.coverName
          ? { name: initial.coverName, url: `/covers/${initial.coverName}` }
          : null
      );
    } else if (open && !initial) {
      setTitle("");
      setContent("");
      setKind("ARTICLE");
      setMediaFileId("none");
      setCover(null);
    }
  }, [open, initial]);

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ coverName: string; url: string }>("/api/upload/cover", {
        method: "POST",
        body: fd,
      });
      setCover({ name: res.coverName, url: res.url });
      toast.success("Couverture prête.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image refusée.");
    } finally {
      setUploadingCover(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      if (editing && initial) {
        await api(`/api/posts/${initial.slug}`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            content,
            kind,
            coverName: cover?.name ?? null,
            mediaFileId: mediaFileId === "none" ? null : mediaFileId,
          }),
        });
        toast.success("Article mis à jour.");
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        await queryClient.invalidateQueries({ queryKey: ["post", initial.slug] });
        onOpenChange(false);
        return;
      }
      const res = await api<{ item: PostDto }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          kind,
          coverName: cover?.name ?? null,
          mediaFileId: mediaFileId === "none" ? null : mediaFileId,
        }),
      });
      toast.success("Publié dans le journal — merci !");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onOpenChange(false);
      setTitle("");
      setContent("");
      setKind("ARTICLE");
      setMediaFileId("none");
      setCover(null);
      navigate(`journal/${res.item.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publication impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Modifier l'article" : "Écrire dans le journal"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Complétez ou ajustez le texte — le titre du lien (slug) reste inchangé."
              : "Un récit, un ressenti, une photo commentée… Mise en page simple : lignes vides = paragraphes, **gras**, tirets pour les listes."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Titre</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. : Nîmes, un voyage entre les pierres"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-kind">Format</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger id="post-kind" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARTICLE">✍️ Article / récit</SelectItem>
                <SelectItem value="PHOTO">📷 Retour en photos</SelectItem>
                <SelectItem value="CAPSULE">🎙 Capsule audio / vidéo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-content">Votre texte</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"Ce qui m'a marqué(e) lors de cette sortie…\n\n- une œuvre\n- un moment\n- un ressenti"}
              className="min-h-40 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              {content.trim().length} caractères (20 minimum)
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Image de couverture (optionnel)</Label>
            {cover ? (
              <div className="relative overflow-hidden rounded-xl">
                <Image src={cover.url} alt="Aperçu de la couverture" width={640} height={360} className="h-40 w-full object-cover" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setCover(null)}
                >
                  Retirer
                </Button>
              </div>
            ) : (
              <label className="flex min-h-20 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-teal/30 bg-brand-teal/5 p-4 text-sm font-medium text-brand-deep transition hover:border-brand-teal/60">
                {uploadingCover ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-4.5 w-4.5" aria-hidden />
                    Choisir une image de couverture
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Image de couverture"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCover(f);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Capsule attachée (audio / vidéo du drive — optionnel)</Label>
            <Select value={mediaFileId} onValueChange={setMediaFileId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune capsule</SelectItem>
                {capsules.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.categoryEmoji} {c.title || c.originalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {capsules.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Astuce : déposez d&apos;abord votre capsule audio dans le{" "}
                <a href="#/drive" className="font-medium text-brand-teal underline-offset-2 hover:underline">
                  drive
                </a>{" "}
                (catégorie « Témoignage »), elle apparaîtra ici.
              </p>
            )}
          </div>
          <Button
            onClick={submit}
            disabled={loading || title.trim().length < 4 || content.trim().length < 20}
            className={editing ? "h-11 w-full rounded-xl bg-brand-teal hover:bg-brand-teal/90" : "h-11 w-full rounded-xl bg-brand-violet hover:bg-brand-violet/90"}
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <PenLine className="mr-1.5 h-4.5 w-4.5" aria-hidden />}
            {loading ? (editing ? "Enregistrement…" : "Publication…") : editing ? "Enregistrer les modifications" : "Publier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function JournalView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  const [editorOpen, setEditorOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api<{ items: PostDto[] }>("/api/posts"),
  });

  const items = data?.items ?? [];
  const [featured, ...rest] = items;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-violet/10">
              <Newspaper className="h-6 w-6 text-brand-violet" aria-hidden />
            </span>
            Journal du groupe
          </h1>
          <p className="mt-2 max-w-xl text-foreground/70">
            La mémoire vivante de nos sorties : articles, photos et capsules, écrits par
            les membres du groupe.
          </p>
        </div>
        {user ? (
          <Button
            className="h-12 rounded-full bg-brand-violet px-6 font-semibold hover:bg-brand-violet/90"
            onClick={() => setEditorOpen(true)}
          >
            <PenLine className="mr-2 h-5 w-5" aria-hidden />
            Écrire dans le journal
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-12 rounded-full border-brand-violet/40 px-6"
            onClick={() => navigate("connexion")}
          >
            <Lock className="mr-2 h-4.5 w-4.5 text-brand-violet" aria-hidden />
            Connectez-vous pour écrire
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand-violet" aria-label="Chargement du journal" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-brand-violet/25 bg-hero-wash p-12 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-brand-violet/70" aria-hidden />
          <h2 className="mt-4 font-display text-xl font-bold">Le journal attend sa première plume</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Compte rendu de Nîmes, souvenirs du musée, idées pour la suite… écrivez ce
            que vous avez envie de partager.
          </p>
          {user && (
            <Button
              className="mt-6 h-11 rounded-full bg-brand-violet px-6 hover:bg-brand-violet/90"
              onClick={() => setEditorOpen(true)}
            >
              <ArrowRight className="mr-2 h-4.5 w-4.5" aria-hidden />
              Commencer un article
            </Button>
          )}
        </div>
      ) : (
        <>
          {featured && (
            <div className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PostCard post={featured} navigate={navigate} featured />
              </motion.div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                >
                  <PostCard post={p} navigate={navigate} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {user && (
        <EditorDialog open={editorOpen} onOpenChange={setEditorOpen} navigate={navigate} />
      )}
    </div>
  );
}
