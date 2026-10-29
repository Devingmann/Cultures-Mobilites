"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Users,
  FolderOpen,
  Newspaper,
  Vote,
  TrendingUp,
  Trash2,
  ShieldCheck,
  Shield,
  Loader2,
  Save,
  KeyRound,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useSession } from "./providers";
import { formatDateShort, type AdminSettings, type AdminStats, type AdminUserDto, type PollDto } from "./types";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export function AdminView({ navigate }: { navigate: (path: string) => void }) {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api<AdminStats>("/api/admin/stats"),
    enabled: user?.role === "ADMIN",
  });
  const { data: users } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ items: AdminUserDto[] }>("/api/admin/users"),
    enabled: user?.role === "ADMIN",
  });
  const { data: poll } = useQuery({
    queryKey: ["poll"],
    queryFn: () => api<PollDto>("/api/poll"),
    enabled: user?.role === "ADMIN",
  });
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => api<AdminSettings>("/api/admin/settings"),
    enabled: user?.role === "ADMIN",
  });

  const [inviteCode, setInviteCode] = useState("");
  const [pollTitle, setPollTitle] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setInviteCode(settings.inviteCode);
      setPollTitle(settings.pollTitle);
    }
  }, [settings]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <Shield className="mx-auto h-10 w-10 text-brand-orange" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-bold">Espace réservé aux administrateurs</h1>
        <p className="mt-2 text-muted-foreground">
          Ce panneau permet de gérer les membres, le sondage et le code d&apos;invitation.
        </p>
        <Button className="mt-6 h-11 rounded-full bg-brand-teal px-6" onClick={() => navigate("accueil")}>
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  const saveSettings = async (patch: Partial<AdminSettings>) => {
    setSavingSettings(true);
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      await queryClient.invalidateQueries({ queryKey: ["poll"] });
      toast.success("Paramètres enregistrés.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSavingSettings(false);
    }
  };

  const changeRole = async (id: string, role: "MEMBER" | "ADMIN", name: string) => {
    try {
      await api(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      toast.success(
        role === "ADMIN" ? `${name} est maintenant administrateur.` : `${name} redevient simple membre.`
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action impossible.");
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer le compte de ${name} ? Ses fichiers, articles et votes seront supprimés.`))
      return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      toast.success("Compte supprimé.");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const statCards = [
    { icon: Users, label: "Membres", value: stats?.members ?? "—", color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { icon: FolderOpen, label: "Fichiers du drive", value: stats ? `${stats.files} (${formatBytes(stats.totalSize)})` : "—", color: "text-brand-orange", bg: "bg-brand-orange/10" },
    { icon: Newspaper, label: "Articles du journal", value: stats?.posts ?? "—", color: "text-brand-violet", bg: "bg-brand-violet/10" },
    {
      icon: Vote,
      label: "Votants au sondage",
      value: stats ? `${stats.voters} / ${stats.members}` : "—",
      color: "text-brand-deep",
      bg: "bg-brand-teal/15",
    },
  ];

  const results = poll?.results
    ? poll.options
        .map((o) => ({
          ...o,
          count: poll.results?.find((r) => r.optionId === o.id)?.count ?? 0,
        }))
        .sort((a, b) => b.count - a.count || a.order - b.order)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-violet/10">
          <Settings className="h-6 w-6 text-brand-violet" aria-hidden />
        </span>
        Administration
      </h1>
      <p className="mt-2 text-foreground/70">
        Gestion du groupe : membres, sondage, code d&apos;invitation et contenu.
      </p>

      {/* Statistiques */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-3xl border border-brand-teal/10 bg-white p-5 shadow-soft">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${s.bg}`}>
              <s.icon className={`h-5.5 w-5.5 ${s.color}`} aria-hidden />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold leading-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="membres" className="mt-10">
        <TabsList className="h-12 rounded-full bg-muted p-1.5">
          <TabsTrigger value="membres" className="h-9 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-soft">
            <Users className="mr-1.5 h-4 w-4" aria-hidden /> Membres
          </TabsTrigger>
          <TabsTrigger value="sondage" className="h-9 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-soft">
            <Vote className="mr-1.5 h-4 w-4" aria-hidden /> Sondage
          </TabsTrigger>
          <TabsTrigger value="parametres" className="h-9 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-soft">
            <KeyRound className="mr-1.5 h-4 w-4" aria-hidden /> Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Onglet membres */}
        <TabsContent value="membres" className="mt-6">
          <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-soft">
            <div className="overflow-x-auto scroll-soft">
              <Table>
                <TableHeader>
                  <TableRow className="bg-brand-teal/5">
                    <TableHead className="pl-5">Membre</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-center">Fichiers</TableHead>
                    <TableHead className="text-center">Articles</TableHead>
                    <TableHead className="text-center">Votes</TableHead>
                    <TableHead className="text-center">Inscrit le</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users?.items ?? []).map((u) => (
                    <TableRow key={u.id} className={u.id === user.id ? "bg-brand-teal/5" : undefined}>
                      <TableCell className="pl-5">
                        <p className="font-semibold">{u.name} {u.id === user.id && <span className="text-xs font-normal text-muted-foreground">(vous)</span>}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </TableCell>
                      <TableCell>
                        {u.role === "ADMIN" ? (
                          <Badge className="rounded-full bg-brand-violet/10 font-medium text-brand-violet">Admin</Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-full font-medium">Membre</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">{u.files}</TableCell>
                      <TableCell className="text-center tabular-nums">{u.posts}</TableCell>
                      <TableCell className="text-center tabular-nums">{u.votes}</TableCell>
                      <TableCell className="text-center text-xs">{formatDateShort(u.createdAt)}</TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-full px-3 text-xs"
                            disabled={u.id === user.id}
                            onClick={() =>
                              changeRole(u.id, u.role === "ADMIN" ? "MEMBER" : "ADMIN", u.name)
                            }
                          >
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden />
                            {u.role === "ADMIN" ? "Rétrograder" : "Promouvoir"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={u.id === user.id}
                            aria-label={`Supprimer le compte de ${u.name}`}
                            onClick={() => deleteUser(u.id, u.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Onglet sondage */}
        <TabsContent value="sondage" className="mt-6">
          {loadingSettings || !settings ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand-teal" aria-label="Chargement" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-5 rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-soft lg:col-span-2">
                <div className="flex items-center justify-between rounded-2xl bg-brand-teal/5 p-4">
                  <div>
                    <p className="font-semibold">Sondage ouvert</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Les membres peuvent voter et modifier leurs choix.
                    </p>
                  </div>
                  <Switch
                    checked={settings.pollOpen}
                    onCheckedChange={(v) => saveSettings({ pollOpen: v })}
                    aria-label="Ouvrir ou fermer le sondage"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="poll-title">Question du sondage</Label>
                  <Textarea
                    id="poll-title"
                    value={pollTitle}
                    onChange={(e) => setPollTitle(e.target.value)}
                    className="min-h-20 rounded-xl"
                    maxLength={200}
                  />
                  <Button
                    className="mt-2 h-11 w-full rounded-xl bg-brand-teal hover:bg-brand-teal/90"
                    disabled={savingSettings || pollTitle === settings.pollTitle}
                    onClick={() => saveSettings({ pollTitle })}
                  >
                    <Save className="mr-2 h-4 w-4" aria-hidden />
                    Enregistrer la question
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-soft lg:col-span-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <TrendingUp className="h-5 w-5 text-brand-teal" aria-hidden />
                  Résultats du sondage
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {results.map((r, i) => {
                    const totalVoters = stats?.voters || 1;
                    const pct = Math.round((r.count / totalVoters) * 100);
                    return (
                      <li key={r.id} className="rounded-xl bg-muted/40 px-4 py-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-medium">
                            <span aria-hidden>{r.emoji}</span> {r.label}
                          </span>
                          <span className="shrink-0 font-bold tabular-nums text-brand-deep">
                            {r.count} <span className="font-normal text-muted-foreground">· {pct}%</span>
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-teal/10" aria-hidden>
                          <div
                            className={`h-full rounded-full ${i === 0 && r.count > 0 ? "bg-orange-warm" : "bg-teal-violet"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Onglet paramètres */}
        <TabsContent value="parametres" className="mt-6">
          {!settings ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand-teal" aria-label="Chargement" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-soft">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <KeyRound className="h-5 w-5 text-brand-orange" aria-hidden />
                  Code d&apos;invitation
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Partagez-le uniquement avec les membres du groupe. Le modifier
                  invalide l&apos;ancien code.
                </p>
                <div className="mt-4 flex gap-2">
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl font-mono tracking-widest"
                    aria-label="Code d'invitation"
                    maxLength={32}
                  />
                  <Button
                    className="h-12 shrink-0 rounded-xl bg-brand-orange px-5 text-white hover:bg-brand-orange/90"
                    disabled={savingSettings || inviteCode === settings.inviteCode || inviteCode.length < 4}
                    onClick={() => saveSettings({ inviteCode })}
                  >
                    <Save className="mr-1.5 h-4 w-4" aria-hidden />
                    Enregistrer
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-brand-teal/10 bg-hero-wash p-6 shadow-soft">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <ScrollText className="h-5 w-5 text-brand-teal" aria-hidden />
                  Rappels du groupe
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
                  <li className="rounded-xl bg-white/70 px-3.5 py-2.5">
                    Les photos et créations ne sont visibles que des membres connectés.
                  </li>
                  <li className="rounded-xl bg-white/70 px-3.5 py-2.5">
                    Chaque envoi d&apos;image demande le respect du droit à l&apos;image.
                  </li>
                  <li className="rounded-xl bg-white/70 px-3.5 py-2.5">
                    La suppression d&apos;un compte efface ses fichiers, articles et votes.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
