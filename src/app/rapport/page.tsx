import type { Metadata } from "next";
import { RapportPageShell } from "@/components/rapport/RapportPageShell";

export const metadata: Metadata = {
  title: "Rapport — VAR 4",
  description:
    "Feuilletez le rapport officiel VAR 4 — Du Virtuel au Réel : chiffres, temps forts et bilan de l'édition.",
};

export default function RapportPage() {
  return <RapportPageShell />;
}
