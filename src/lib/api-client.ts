/* Client API léger — erreurs en français, JSON, même origine. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : undefined),
      ...init?.headers,
    },
  });
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    /* réponse vide */
  }
  if (!res.ok) {
    const message =
      (data as { error?: string })?.error ?? "Une erreur est survenue. Réessayez.";
    throw new Error(message);
  }
  return data as T;
}
