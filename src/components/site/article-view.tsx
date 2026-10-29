"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Trash2,
  Loader2,
  Mic,
  Lock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import { formatDateFr, type ArticleDto } from "./types";

export function ArticleView({
  slug,
  navigate,
}: {
  slug: string;
  navigate: (path: string) => void;
}) {
  const { user } = useSession();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => api<{ item: ArticleDto }>(`/api/posts/${slug}`),
  });

  const remove = async () => {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    try {
      await api(`/api/posts/${slug}`, { method: "DELETE" });
      toast.success("Article supprimé.");
      navigate("journal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand-teal" aria-label="Chargement de l'article" />
      </div>
    );
  }

  if (isError || !data?.item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Article introuvable</h1>
        <p className="mt-2 text-muted-foreground">
          {error instanceof Error ? error.message : "Il a peut-être été supprimé."}
        </p>
        <Button
          variant="outline"
          className="mt-6 h-11 rounded-full"
          onClick={() => navigate("journal")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Retour au journal
        </Button>
      </div>
    );
  }

  const post = data.item;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <button
        onClick={() => navigate("journal")}
        className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition hover:bg-brand-teal/5 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour au journal
      </button>

      <article className="mt-6">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4 text-brand-teal" aria-hidden />
            {post.author.name}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-brand-teal" aria-hidden />
            {formatDateFr(post.createdAt)}
          </span>
          {post.media && (
            <Badge className="rounded-full bg-brand-teal/10 text-[11px] font-medium text-brand-teal">
              <Mic className="mr-1 h-3 w-3" aria-hidden /> capsule attachée
            </Badge>
          )}
        </div>

        {post.coverName && (
          <div className="mt-8 overflow-hidden rounded-3xl border-4 border-white shadow-lift">
            <Image
              src={`/covers/${post.coverName}`}
              alt={`Couverture : ${post.title}`}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}

        <div className="prose-custom mt-8">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-5 text-[17px] leading-relaxed text-foreground/85">{children}</p>
              ),
              h2: ({ children }) => (
                <h2 className="mb-3 mt-8 font-display text-2xl font-bold text-foreground">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-6 font-display text-xl font-semibold text-foreground">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="mb-5 ml-1 space-y-2 text-[16px] text-foreground/85 [&>li]:relative [&>li]:pl-5">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed before:absolute before:left-1 before:top-2.5 before:h-2 before:w-2 before:rounded-full before:bg-brand-teal">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mb-5 rounded-2xl border-l-4 border-brand-orange bg-brand-orange-light px-5 py-4 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Capsule attachée */}
        {post.media && (
          <div className="mt-10 rounded-3xl border border-brand-teal/15 bg-hero-wash p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Mic className="h-5 w-5 text-brand-teal" aria-hidden />
              Capsule attachée : {post.media.title}
            </h2>
            {post.media.url ? (
              post.media.mimeType.startsWith("audio/") ? (
                <audio controls className="mt-4 w-full" src={post.media.url}>
                  Votre navigateur ne lit pas l&apos;audio.
                </audio>
              ) : (
                <video controls className="mt-4 w-full rounded-2xl" src={post.media.url}>
                  Votre navigateur ne lit pas la vidéo.
                </video>
              )
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-brand-orange" aria-hidden />
                  Écoute réservée aux membres connectés.
                </p>
                <Button
                  className="h-10 rounded-full bg-brand-teal px-5 text-sm hover:bg-brand-teal/90"
                  onClick={() => navigate("connexion")}
                >
                  Se connecter
                </Button>
              </div>
            )}
            {post.media.url && (
              <Button asChild variant="outline" size="sm" className="mt-3 h-9 rounded-full">
                <a href={`/api/files/${post.media.id}/raw?dl=1`}>
                  <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Télécharger la capsule
                </a>
              </Button>
            )}
          </div>
        )}

        {(post.isMine || user?.role === "ADMIN") && (
          <div className="mt-10 flex justify-end border-t border-brand-teal/10 pt-5">
            <Button
              variant="outline"
              className="h-11 rounded-full border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={remove}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              Supprimer cet article
            </Button>
          </div>
        )}
      </article>
    </div>
  );
}
