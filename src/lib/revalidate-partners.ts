import { revalidatePath } from "next/cache";

/** Invalide la homepage et l’API publique après changement partenaires (backoffice). */
export function revalidatePartnerPublicPages() {
  revalidatePath("/");
}
