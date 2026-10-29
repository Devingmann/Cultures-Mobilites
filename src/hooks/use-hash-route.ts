"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type Route = { view: string; param: string };

function parse(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "");
  const [view, param] = raw.split("/");
  return { view: view || "accueil", param: param ? decodeURIComponent(param) : "" };
}

function subscribe(onChange: () => void) {
  const handler = () => {
    onChange();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  window.addEventListener("hashchange", handler);
  return () => window.removeEventListener("hashchange", handler);
}

/* Routeur par hash : #/vue/paramètre — fonctionne dans l'aperçu une-page. */
export function useHashRoute() {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash || "#/accueil",
    () => "#/accueil"
  );

  const route = useMemo(() => parse(hash), [hash]);

  const navigate = useCallback((path: string) => {
    const clean = path.startsWith("#") ? path : `#/${path.replace(/^\/+/, "")}`;
    if (window.location.hash === clean) {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = clean;
    }
  }, []);

  return { route, navigate };
}
