import type { Metadata } from "next";
import { ContactPageShell } from "@/components/contact/ContactPageShell";

export const metadata: Metadata = {
  title: "Contact — VAR 4",
  description:
    "Contactez l'équipe VAR 4 pour le sponsoring, les partenariats, les stands ou toute autre demande.",
};

export default function ContactPage() {
  return <ContactPageShell />;
}
