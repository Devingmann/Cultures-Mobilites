"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  Lock,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
  LayoutDashboard,
  Images,
  FolderOpen,
  Vote,
  Newspaper,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useSession } from "./providers";
import type { Route } from "@/hooks/use-hash-route";
import { ProfileDialog } from "./profile-dialog";
import { api } from "@/lib/api-client";

const LINKS = [
  { view: "accueil", label: "Accueil", icon: Home, locked: false },
  { view: "journal", label: "Journal", icon: Newspaper, locked: false },
  { view: "sondage", label: "Sondage", icon: Vote, locked: false },
  { view: "galerie", label: "Galerie", icon: Images, locked: true },
  { view: "drive", label: "Drive", icon: FolderOpen, locked: true },
];

export function Navbar({
  route,
  navigate,
}: {
  route: Route;
  navigate: (path: string) => void;
}) {
  const { user, setUser } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const go = (view: string) => {
    navigate(view);
    setMobileOpen(false);
  };

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* la session sera de toute façon nettoyée côté serveur */
    }
    setUser(null);
    navigate("accueil");
    window.location.reload();
  };

  const initials = user
    ? user.name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-40 border-b border-brand-teal/10 bg-white/85 backdrop-blur-md">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
      >
        <button
          onClick={() => go("accueil")}
          className="flex min-h-11 items-center gap-2.5"
          aria-label="Cultures et Mobilités — retour à l'accueil"
        >
          <Image
            src="/images/logo-badge.png"
            alt="Logo Cultures et Mobilités"
            width={44}
            height={44}
            className="h-10 w-10"
            priority
          />
          <span className="flex flex-col items-start leading-none">
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground sm:text-base">
              Cultures <span className="text-brand-teal">et</span> Mobilités
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Photos, retours de sorties et avis
            </span>
          </span>
        </button>

        {/* Navigation bureau */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ view, label, locked }) => {
            const active = route.view === view;
            const gated = locked && !user;
            return (
              <li key={view}>
                <button
                  onClick={() => go(view)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-teal/10 text-brand-deep"
                      : "text-muted-foreground hover:bg-brand-teal/5 hover:text-foreground"
                  }`}
                >
                  {label}
                  {gated && (
                    <Lock className="h-3.5 w-3.5 text-brand-orange" aria-label="Réservé aux membres" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Zone droite */}
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button
                variant="ghost"
                className="h-11 hidden sm:inline-flex"
                onClick={() => go("connexion")}
              >
                Connexion
              </Button>
              <Button
                className="h-11 bg-brand-teal hover:bg-brand-teal/90"
                onClick={() => go("inscription")}
              >
                Rejoindre le groupe
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex min-h-11 items-center gap-2 rounded-full border border-brand-teal/15 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium shadow-soft transition hover:border-brand-teal/40"
                  aria-label="Menu du compte"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-violet text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <span className="block text-sm font-semibold">{user.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => go("espace")} className="min-h-10 gap-2">
                  <LayoutDashboard className="h-4 w-4 text-brand-teal" /> Mon espace
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => go("admin")} className="min-h-10 gap-2">
                    <Settings className="h-4 w-4 text-brand-violet" /> Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setProfileOpen(true)}
                  className="min-h-10 gap-2"
                >
                  <UserRound className="h-4 w-4 text-brand-orange" /> Mon profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="min-h-10 gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Menu mobile */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-brand-teal/5 md:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-cream p-0">
              <SheetTitle className="flex items-center gap-2 border-b border-brand-teal/10 px-5 py-4">
                <Image
                  src="/images/logo-badge.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="font-display text-sm font-bold">Cultures et Mobilités</span>
              </SheetTitle>
              <ul className="flex flex-col gap-1 p-3">
                {LINKS.map(({ view, label, icon: Icon, locked }) => {
                  const gated = locked && !user;
                  return (
                    <li key={view}>
                      <button
                        onClick={() => go(view)}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium ${
                          route.view === view
                            ? "bg-brand-teal/10 text-brand-deep"
                            : "text-foreground/80 hover:bg-brand-teal/5"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 text-brand-teal" />
                        {label}
                        {gated && <Lock className="ml-auto h-3.5 w-3.5 text-brand-orange" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {user && (
                <Button
                  variant="outline"
                  className="mx-4 mt-2 min-h-11 w-[calc(100%-2rem)] justify-start gap-2 border-destructive/30 text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </Button>
              )}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => window.dispatchEvent(new Event("close-sheet")), 50);
                }}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
              >
                fermer
              </button>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
