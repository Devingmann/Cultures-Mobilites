"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CATEGORIES, type FileDto } from "./types";

const MAX = 50 * 1024 * 1024;

export function UploadDialog({
  open,
  onOpenChange,
  defaultCategory = "PHOTO",
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: keyof typeof CATEGORIES;
  onUploaded?: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<keyof typeof CATEGORIES>(defaultCategory);
  const [consent, setConsent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const needsConsent = category === "PHOTO" || category === "CREATION";

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > MAX);
    if (tooBig) {
      toast.error(`« ${tooBig.name} » dépasse 50 Mo.`);
      return;
    }
    setFiles((prev) => [...prev, ...incoming]);
  };

  const reset = () => {
    setFiles([]);
    setTitle("");
    setDescription("");
    setConsent(false);
    setLoading(false);
  };

  const submit = async () => {
    if (files.length === 0) {
      toast.error("Sélectionnez au moins un fichier.");
      return;
    }
    if (needsConsent && !consent) {
      toast.error("Cochez la case de consentement (droit à l'image) pour continuer.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      const res = await api<{ created: number }>("/api/files", {
        method: "POST",
        body: fd,
      });
      toast.success(
        res.created === 1
          ? "Fichier ajouté au drive."
          : `${res.created} fichiers ajoutés au drive.`
      );
      queryClient.invalidateQueries({ queryKey: ["files"] });
      reset();
      onOpenChange(false);
      onUploaded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Ajouter au drive du groupe</DialogTitle>
          <DialogDescription>
            Photos, créations, capsules audio… tout le groupe pourra consulter vos envois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de dépôt */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Choisir des fichiers à envoyer"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
              dragOver
                ? "border-brand-teal bg-brand-teal/10"
                : "border-brand-teal/30 bg-brand-teal/5 hover:border-brand-teal/60 hover:bg-brand-teal/10"
            }`}
          >
            <UploadCloud className="h-8 w-8 text-brand-teal" aria-hidden />
            <p className="mt-2 text-sm font-medium">
              Glissez vos fichiers ici, ou cliquez pour parcourir
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Images, vidéo, audio, PDF — 50 Mo max par fichier
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {files.length > 0 && (
            <ul className="max-h-40 space-y-1.5 overflow-y-auto scroll-soft rounded-xl bg-muted/50 p-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"
                >
                  <FileText className="h-4 w-4 shrink-0 text-brand-teal" aria-hidden />
                  <span className="truncate">{f.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {(f.size / (1024 * 1024)).toFixed(1)} Mo
                  </span>
                  <button
                    aria-label={`Retirer ${f.name}`}
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="upload-category">Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as keyof typeof CATEGORIES)}>
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    {meta.emoji} {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upload-title">
              Titre {files.length > 1 ? "(commun aux fichiers)" : "(optionnel)"}
            </Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. : Sortie à Nîmes, musée de la Romanité"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upload-desc">Petite description (optionnel)</Label>
            <Textarea
              id="upload-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Le contexte, un ressenti, une anecdote…"
              className="min-h-20 rounded-xl"
              maxLength={400}
            />
          </div>

          {needsConsent && (
            <label className="flex items-start gap-2.5 rounded-xl border border-brand-orange/30 bg-brand-orange-light p-3 text-sm">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
                aria-label="Consentement droit à l'image"
              />
              <span>
                J&apos;ai le droit de partager ces images : les personnes photographiées
                (ou leur responsable) sont d&apos;accord, et le partage dans le groupe est
                adapté. <span className="text-brand-orange">(Requis)</span>
              </span>
            </label>
          )}

          <Button
            onClick={submit}
            disabled={loading}
            className="h-11 w-full rounded-xl bg-brand-teal hover:bg-brand-teal/90"
          >
            {loading ? "Envoi en cours…" : `Envoyer ${files.length || ""} fichier${files.length > 1 ? "s" : ""}`.trim()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { FileDto };
