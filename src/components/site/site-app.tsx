"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useHashRoute } from "@/hooks/use-hash-route";
import { Providers, useSession } from "./providers";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { HomeView } from "./home-view";
import { ConnexionView, InscriptionView } from "./auth-views";
import { EspaceView } from "./espace-view";
import { DriveView } from "./drive-view";
import { GalerieView } from "./galerie-view";
import { SondageView } from "./sondage-view";
import { JournalView } from "./journal-view";
import { ArticleView } from "./article-view";
import { AdminView } from "./admin-view";
import type { CurrentUser } from "./types";

const GUARDED = new Set(["drive", "galerie", "espace", "admin"]);

function Shell() {
  const { route, navigate } = useHashRoute();
  const { user } = useSession();

  // Garde : si l'espace demande une connexion, basculer vers la connexion
  useEffect(() => {
    if (GUARDED.has(route.view) && !user && route.view !== "connexion") {
      navigate("connexion");
    }
  }, [route.view, user, navigate]);

  const view = route.view;
  let content: React.ReactNode;
  switch (view) {
    case "accueil":
      content = <HomeView navigate={navigate} />;
      break;
    case "connexion":
      content = <ConnexionView navigate={navigate} />;
      break;
    case "inscription":
      content = <InscriptionView navigate={navigate} />;
      break;
    case "espace":
      content = user ? <EspaceView navigate={navigate} /> : null;
      break;
    case "drive":
      content = user ? <DriveView navigate={navigate} /> : null;
      break;
    case "galerie":
      content = user ? <GalerieView navigate={navigate} /> : null;
      break;
    case "sondage":
      content = <SondageView navigate={navigate} />;
      break;
    case "journal":
      content = route.param ? (
        <ArticleView slug={route.param} navigate={navigate} />
      ) : (
        <JournalView navigate={navigate} />
      );
      break;
    case "admin":
      content = <AdminView navigate={navigate} />;
      break;
    default:
      content = <HomeView navigate={navigate} />;
  }
  const motionKey = view + (route.param ? `/${route.param}` : "");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar route={route} navigate={navigate} />
      <main id="contenu" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={motionKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export function SiteApp({ initialUser }: { initialUser: CurrentUser | null }) {
  return (
    <Providers initialUser={initialUser}>
      <Shell />
    </Providers>
  );
}
