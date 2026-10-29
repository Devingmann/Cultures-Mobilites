"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import type { CurrentUser } from "./types";

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user, setUser } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const submit = async () => {
    setLoading(true);
    try {
      const body: Record<string, string> = {};
      if (name !== user.name) body.name = name;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (Object.keys(body).length === 0) {
        toast.info("Aucune modification à enregistrer.");
        return;
      }
      const res = await api<{ user: CurrentUser }>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setUser(res.user);
      setCurrentPassword("");
      setNewPassword("");
      onOpenChange(false);
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Mon profil</DialogTitle>
          <DialogDescription>
            Modifiez votre nom affiché ou votre mot de passe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nom affiché</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Adresse e-mail</Label>
            <Input id="profile-email" value={user.email} disabled className="h-11 bg-muted/60" />
          </div>
          <div className="rounded-xl border border-brand-teal/15 bg-brand-teal/5 p-3">
            <p className="text-xs text-muted-foreground">
              Mot de passe — laissez vide si vous ne souhaitez pas le changer.
            </p>
            <div className="mt-2 space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11"
                autoComplete="current-password"
              />
              <Input
                type="password"
                placeholder="Nouveau mot de passe (8+ caractères, lettres + chiffres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
                autoComplete="new-password"
              />
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={loading}
            className="h-11 w-full bg-brand-teal hover:bg-brand-teal/90"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
