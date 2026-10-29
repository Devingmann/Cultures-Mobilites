import { getSessionUser } from "@/lib/auth";
import { SiteApp } from "@/components/site/site-app";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getSessionUser();
  return (
    <SiteApp
      initialUser={
        user
          ? { id: user.id, name: user.name, email: user.email, role: user.role }
          : null
      }
    />
  );
}
