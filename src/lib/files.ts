import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export const STORAGE_DIR = path.join(process.cwd(), "storage", "uploads");
export const COVERS_DIR = path.join(process.cwd(), "public", "covers");
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo
export const MAX_COVER_SIZE = 10 * 1024 * 1024;

export const CATEGORIES = {
  PHOTO: { label: "Photo de sortie", emoji: "📷", drive: "photo" },
  CREATION: { label: "Création artistique", emoji: "🎨", drive: "creation" },
  TEMOIGNAGE: { label: "Témoignage / capsule", emoji: "🎙", drive: "temoignage" },
  DOCUMENT: { label: "Document", emoji: "📄", drive: "document" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function isCategory(v: string): v is CategoryKey {
  return v in CATEGORIES;
}

export type FileKind = "IMAGE" | "VIDEO" | "AUDIO" | "PDF" | "OTHER";

export function kindFromMime(mime: string): FileKind {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime === "application/pdf") return "PDF";
  return "OTHER";
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/wav": ".wav",
  "audio/webm": ".weba",
  "audio/ogg": ".ogg",
  "application/pdf": ".pdf",
};

export function safeStoredName(originalName: string, mime: string): string {
  const known = EXT_BY_MIME[mime];
  const ext = known || path.extname(originalName).toLowerCase().slice(0, 10) || "";
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
}

export function sanitizeName(name: string): string {
  return (
    name
      .normalize("NFC")
      .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, "")
      .trim()
      .slice(0, 180) || "fichier"
  );
}

export async function ensureStorage(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

export async function ensureCovers(): Promise<void> {
  try {
    await fs.mkdir(COVERS_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

/** Ancien stockage local uniquement (dev sans Cloudinary). */
export async function writeStoredFile(
  storedName: string,
  buffer: Buffer
): Promise<void> {
  await ensureStorage();
  await fs.writeFile(path.join(STORAGE_DIR, storedName), buffer);
}

export async function readStoredFile(storedName: string): Promise<Buffer> {
  if (storedName.startsWith("http://") || storedName.startsWith("https://")) {
    const res = await fetch(storedName);
    if (!res.ok) throw new Error("Lecture distante impossible.");
    return Buffer.from(await res.arrayBuffer());
  }
  return fs.readFile(path.join(STORAGE_DIR, storedName));
}

export async function deleteStoredFile(storedName: string): Promise<void> {
  // Cloudinary / URL distante : on ne supprime que en base (optionnel : Admin API)
  if (storedName.startsWith("http://") || storedName.startsWith("https://")) {
    return;
  }
  await fs.unlink(path.join(STORAGE_DIR, storedName)).catch(() => undefined);
}

export async function deleteCover(coverName: string): Promise<void> {
  if (!coverName) return;
  await fs.unlink(path.join(COVERS_DIR, coverName)).catch(() => undefined);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "article"
  );
}

export function excerptOf(content: string, max = 180): string {
  const plain = content
    .replace(/[#*_>`\-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max).trim()}…` : plain;
}