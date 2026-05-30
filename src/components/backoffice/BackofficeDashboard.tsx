"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackofficeInscriptionsPanel } from "@/components/backoffice/BackofficeInscriptionsPanel";
import { BackofficePartnersPanel } from "@/components/backoffice/BackofficePartnersPanel";

type BackofficeTab = "inscriptions" | "partners";

const TABS: { id: BackofficeTab; label: string; description: string }[] = [
  { id: "inscriptions", label: "Inscrits", description: "Liste et export" },
  { id: "partners", label: "Partenaires", description: "Logos et visibilité" },
];

export function BackofficeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BackofficeTab>("inscriptions");

  async function handleLogout() {
    await fetch("/api/backoffice/auth/logout", { method: "POST" });
    router.replace("/backoffice/login");
    router.refresh();
  }

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <div className="backoffice-dashboard">
      <header className="backoffice-dashboard__hero">
        <div className="backoffice-dashboard__hero-copy">
          <p className="backoffice-dashboard__eyebrow">VAR 4 · Backoffice</p>
          <h1 className="backoffice-dashboard__title">{activeTabMeta.label}</h1>
          <p className="backoffice-dashboard__subtitle">{activeTabMeta.description}</p>
        </div>

        <div className="backoffice-dashboard__actions">
          <button
            type="button"
            className="backoffice-button backoffice-button--ghost"
            onClick={() => void handleLogout()}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <nav className="backoffice-tabs" role="tablist" aria-label="Sections backoffice">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`backoffice-tabs__button${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="backoffice-tabs__label">{tab.label}</span>
            <span className="backoffice-tabs__hint">{tab.description}</span>
          </button>
        ))}
      </nav>

      <div className="backoffice-tabpanel" role="tabpanel">
        {activeTab === "inscriptions" ? <BackofficeInscriptionsPanel /> : <BackofficePartnersPanel />}
      </div>
    </div>
  );
}
