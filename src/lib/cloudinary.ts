/** Config Cloudinary publique (upload unsigned côté navigateur). */
export const CLOUDINARY_CLOUD_NAME = "pnse5sza";
export const CLOUDINARY_UPLOAD_PRESET = "mlojkol";

/** Dossier racine sur Cloudinary (dynamic folders). */
export const CLOUDINARY_ROOT = "cultures-mobilite";

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
};

/**
 * Upload direct navigateur → Cloudinary (unsigned preset).
 * resource_type "auto" gère image / vidéo / audio / raw (PDF).
 */
export async function uploadToCloudinary(
  file: File,
  folderSuffix?: string
): Promise<CloudinaryUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const folder = folderSuffix
    ? `${CLOUDINARY_ROOT}/${folderSuffix}`
    : CLOUDINARY_ROOT;
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    let msg = "Échec de l'envoi vers Cloudinary.";
    try {
      const err = await res.json();
      if (err?.error?.message) msg = err.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

/** URL d'affichage / téléchargement d'un FileItem. */
export function mediaUrl(fileName: string, id: string): string {
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    return fileName;
  }
  return `/api/files/${id}/raw`;
}

export function downloadUrl(fileName: string, id: string): string {
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    return fileName;
  }
  return `/api/files/${id}/raw?dl=1`;
}