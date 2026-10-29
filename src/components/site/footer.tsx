"use client";

import Image from "next/image";
import { Heart, MapPin } from "lucide-react";

export function Footer({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer className="mt-auto border-t border-brand-teal/10 bg-[#f6f1e9]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-badge.png"
              alt="Logo Cultures et Mobilités"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <p className="font-display text-base font-bold leading-tight">
              Cultures <span className="text-brand-teal">et</span> Mobilités
            </p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Le site du groupe « Culture et mobilité » : garder une trace de nos sorties
            culturelles, partager nos découvertes et décider ensemble de la suite.
          </p>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" aria-hidden />
            Maison des Services de Ganges et alentours (34)
          </p>
        </div>

        <nav aria-label="Espaces du site">
          <p className="font-display text-sm font-semibold tracking-wide text-foreground/70">
            Les espaces
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              { path: "journal", label: "Journal du groupe" },
              { path: "sondage", label: "Sondage de la prochaine sortie" },
              { path: "galerie", label: "Galerie photo (membres)" },
              { path: "drive", label: "Drive partagé (membres)" },
              { path: "espace", label: "Mon espace" },
            ].map((l) => (
              <li key={l.path}>
                <button
                  onClick={() => navigate(l.path)}
                  className="min-h-8 text-left transition hover:text-brand-teal hover:underline"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-foreground/70">
            Le projet « Culture et mobilité »
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Un projet transversal porté par trois dispositifs :
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="rounded-lg bg-white/60 px-3 py-2">
              APIJE Mobilité — Marie Vincent
            </li>
            <li className="rounded-lg bg-white/60 px-3 py-2">
              SCIC IFAD Accompagnement Intégré — Anne Marie Lamboray
            </li>
            <li className="rounded-lg bg-white/60 px-3 py-2">
              IFAD SCOP Parcours Santé Mieux Être — Leslie Vorstermans
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-teal/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 Projet « Culture et mobilité » — tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" aria-hidden />{" "}
            pour le groupe
          </p>
        </div>
      </div>
    </footer>
  );
}
