"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { BackofficeInscriptionRow } from "@/lib/backoffice-inscriptions";

type ListResponse = {
  items: BackofficeInscriptionRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
};

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function BackofficeInscriptionsPanel() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadInscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(page) });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const response = await fetch(`/api/backoffice/inscriptions?${params.toString()}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as ListResponse;

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/backoffice/login");
          return;
        }

        throw new Error(payload.error ?? "Impossible de charger les inscrits.");
      }

      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les inscrits.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, router]);

  useEffect(() => {
    void loadInscriptions();
  }, [loadInscriptions]);

  async function handleExport() {
    setIsExporting(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const query = params.toString();
      const response = await fetch(
        `/api/backoffice/inscriptions/export${query ? `?${query}` : ""}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/backoffice/login");
          return;
        }

        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Export impossible.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
      const filename = match?.[1] ?? "var4-inscrits.xlsx";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="backoffice-panel">
      <section className="backoffice-panel__section" aria-labelledby="inscriptions-list-title">
        <div className="backoffice-panel__section-head backoffice-panel__section-head--split">
          <div>
            <p className="backoffice-panel__section-eyebrow">Gestion</p>
            <h2 id="inscriptions-list-title" className="backoffice-panel__section-title">
              Inscriptions reçues
            </h2>
          </div>

          <div className="backoffice-stat-chips" aria-live="polite">
            <span className="backoffice-stat-chip backoffice-stat-chip--sky">
              <strong>{data ? data.total : "—"}</strong> inscription{data && data.total > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="backoffice-panel__toolbar">
          <label className="backoffice-field backoffice-field--search">
            <span className="backoffice-field__label">Rechercher</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="backoffice-field__input"
              placeholder="Nom, e-mail, ville, pseudo…"
            />
          </label>

          <button
            type="button"
            className="backoffice-button backoffice-button--primary"
            onClick={() => void handleExport()}
            disabled={isExporting || isLoading}
          >
            {isExporting ? "Export…" : "Exporter Excel"}
          </button>
        </div>

        {error ? (
          <p className="backoffice-dashboard__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="backoffice-table-wrap">
        <table className="backoffice-table">
          <thead>
            <tr>
              <th scope="col">Photo</th>
              <th scope="col">Date</th>
              <th scope="col">Nom</th>
              <th scope="col">E-mail / Tél.</th>
              <th scope="col">Ville</th>
              <th scope="col">Réseau</th>
              <th scope="col">Titre communauté</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="backoffice-table__empty">
                  Chargement des inscriptions...
                </td>
              </tr>
            ) : null}

            {!isLoading && data?.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="backoffice-table__empty">
                  Aucune inscription trouvée.
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? data?.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="backoffice-table__photo">
                        {item.photoUrl ? (
                          <Image
                            src={item.photoUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="backoffice-table__photo-image"
                          />
                        ) : (
                          <span className="backoffice-table__photo-fallback" aria-hidden>
                            {getInitials(item.fullName)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDisplayDate(item.createdAt)}</td>
                    <td>{item.fullName}</td>
                    <td>{item.contact}</td>
                    <td>{item.city}</td>
                    <td>{item.socialNetwork}</td>
                    <td>{item.communityTitle}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

        {data && data.totalPages > 1 ? (
          <div className="backoffice-pagination">
            <button
              type="button"
              className="backoffice-button backoffice-button--ghost"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Précédent
            </button>
            <p className="backoffice-pagination__label">
              Page {data.page} / {data.totalPages}
            </p>
            <button
              type="button"
              className="backoffice-button backoffice-button--ghost"
              disabled={page >= data.totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Suivant
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
