import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BackofficeDashboard } from "@/components/backoffice/BackofficeDashboard";
import { isBackofficeAuthenticated, isBackofficeConfigured } from "@/lib/backoffice-auth";

export const metadata: Metadata = {
  title: "Inscrits — Backoffice VAR 4",
  robots: { index: false, follow: false },
};

export default async function BackofficePage() {
  if (!isBackofficeConfigured()) {
    redirect("/backoffice/login");
  }

  if (!(await isBackofficeAuthenticated())) {
    redirect("/backoffice/login");
  }

  return (
    <main className="backoffice-shell">
      <BackofficeDashboard />
    </main>
  );
}
