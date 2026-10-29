"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, LogIn, UserPlus, ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import type { CurrentUser } from "./types";

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
      <div className="relative hidden overflow-hidden rounded-[2rem] bg-hero-wash-deep p-10 md:block">
        <div
          aria-hidden
          className="animate-blob absolute -right-16 -top-16 h-64 w-64 bg-white/30 blur-2xl"
        />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <Image
              src="/images/logo-badge.png"
              alt="Logo Cultures et Mobilités"
              width={120}
              height={120}
              className="h-28 w-28"
            />
            <h2 className="mt-8 font-display text-3xl font-extrabold leading-tight text-brand-deep">
              Le site du groupe
              <br />
              « Culture et mobilité »
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-brand-deep/75">
              Journal des sorties, galerie photo, drive partagé et sondages : un espace
              bienveillant pour garder une trace de nos découvertes culturelles.
            </p>
          </div>
          <ul className="space-y-2.5 text-sm text-brand-deep/80">
            <li className="flex items-center gap-2.5 rounded-xl bg-white/60 px-4 py-3">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-brand-teal" aria-hidden />
              Vos photos restent entre membres (droit à l&apos;image)
            </li>
            <li className="flex items-center gap-2.5 rounded-xl bg-white/60 px-4 py-3">
              <KeyRound className="h-4.5 w-4.5 shrink-0 text-brand-orange" aria-hidden />
              Compte protégé par mot de passe et code d&apos;invitation
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[2rem] border border-brand-teal/10 bg-white p-7 shadow-lift sm:p-9">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 border-t border-brand-teal/10 pt-5 text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConnexionView({ navigate }: { navigate: (path: string) => void }) {
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ user: CurrentUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(res.user);
      toast.success(`Bienvenue ${res.user.name.split(" ")[0]} !`);
      navigate("espace");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Content de vous revoir"
      subtitle="Connectez-vous pour accéder à la galerie, au drive et au vote."
      footer={
        <p>
          Pas encore de compte ?{" "}
          <button
            onClick={() => navigate("inscription")}
            className="font-semibold text-brand-teal underline-offset-4 hover:underline"
          >
            Créer un compte avec le code d&apos;invitation
          </button>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Adresse e-mail</Label>
          <Input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@exemple.fr"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-brand-teal text-[15px] font-semibold hover:bg-brand-teal/90"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" aria-hidden />}
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function InscriptionView({ navigate }: { navigate: (path: string) => void }) {
  const { setUser } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    inviteCode: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ user: CurrentUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          inviteCode: form.inviteCode,
        }),
      });
      setUser(res.user);
      toast.success("Bienvenue dans le groupe !");
      navigate("espace");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Rejoindre le groupe"
      subtitle="Un compte par personne, avec le code d'invitation partagé par les animateurs."
      footer={
        <p>
          Déjà inscrit ?{" "}
          <button
            onClick={() => navigate("connexion")}
            className="font-semibold text-brand-teal underline-offset-4 hover:underline"
          >
            Connectez-vous ici
          </button>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">Nom et prénom</Label>
          <Input
            id="reg-name"
            required
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            placeholder="Marie Dupont"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Adresse e-mail</Label>
          <Input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder="prenom.nom@exemple.fr"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Mot de passe</Label>
            <Input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder="8 caractères min., lettres + chiffres"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">Confirmation</Label>
            <Input
              id="reg-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
              className="h-12 rounded-xl"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-code">Code d&apos;invitation du groupe</Label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-brand-orange" aria-hidden />
            <Input
              id="reg-code"
              required
              value={form.inviteCode}
              onChange={set("inviteCode")}
              placeholder="Demandez-le aux animateurs"
              className="h-12 rounded-xl pl-11 uppercase tracking-wide"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-brand-teal text-[15px] font-semibold hover:bg-brand-teal/90"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" aria-hidden />}
          {loading ? "Création…" : "Créer mon compte"}
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          En créant un compte, vous vous engagez à respecter le droit à l&apos;image :
          ne partagez que des photos où les personnes concernées sont d&apos;accord.
        </p>
      </form>
    </AuthShell>
  );
}
