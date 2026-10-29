/* Types partagés côté client (réponses API). */

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type PollOptionDto = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  order: number;
};

export type PollDto = {
  pollOpen: boolean;
  pollTitle: string;
  options: PollOptionDto[];
  results: { optionId: string; count: number }[] | null;
  voters: number | null;
  myVotes: string[] | null;
};

export type FileDto = {
  id: string;
  title: string;
  description: string | null;
  category: "PHOTO" | "CREATION" | "TEMOIGNAGE" | "DOCUMENT";
  categoryLabel: string;
  categoryEmoji: string;
  originalName: string;
  mimeType: string;
  kind: "IMAGE" | "VIDEO" | "AUDIO" | "PDF" | "OTHER";
  size: number;
  sizeLabel: string;
  createdAt: string;
  uploader: { id: string; name: string };
  isMine: boolean;
};

export type FilesResponse = {
  items: FileDto[];
  total: number;
  totalSizeLabel: string;
};

export type PostDto = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  coverName: string | null;
  hasMedia: boolean;
  mediaKind: string | null;
  excerpt: string;
  createdAt: string;
  author: { id: string; name: string };
};

export type ArticleDto = PostDto & {
  content: string;
  media: { id: string; title: string; mimeType: string; url: string | null } | null;
  isMine: boolean;
};

export type AdminStats = {
  members: number;
  files: number;
  totalSize: number;
  posts: number;
  votes: number;
  voters: number;
  pollOptions: number;
};

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  files: number;
  posts: number;
  votes: number;
};

export type AdminSettings = {
  inviteCode: string;
  pollOpen: boolean;
  pollTitle: string;
};

export const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  PHOTO: { label: "Photo de sortie", emoji: "📷" },
  CREATION: { label: "Création artistique", emoji: "🎨" },
  TEMOIGNAGE: { label: "Témoignage / capsule", emoji: "🎙" },
  DOCUMENT: { label: "Document", emoji: "📄" },
};

export const KIND_LABELS: Record<string, { label: string; icon: string }> = {
  IMAGE: { label: "Image", icon: "image" },
  VIDEO: { label: "Vidéo", icon: "film" },
  AUDIO: { label: "Audio", icon: "mic" },
  PDF: { label: "PDF", icon: "file-text" },
  OTHER: { label: "Fichier", icon: "file" },
};

export function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
