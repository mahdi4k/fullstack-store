import type { Metadata } from "next";
import { RequireAuth } from "@/components/providers/auth-provider";
import { ProfileView } from "@/components/account/profile-view";
import { serverLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await serverLocale());
  return { title: dict.profile.title };
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}
