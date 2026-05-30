import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — VAR 4",
  description:
    "Conditions générales d'utilisation du site VAR 4 et du service d'inscription à l'événement.",
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPageShell
      title="Conditions d'utilisation"
      updatedAt="28 mai 2026"
      headerImage="/img/img06.jpg"
    >
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation du site{" "}
          <strong>VAR 4 — Du Virtuel au Réel</strong> (ci-après « le Site »), édité par{" "}
          <strong>Team Booster Digital | Miteka Advertising</strong>, ainsi que le service
          d&apos;inscription en ligne à l&apos;événement VAR 4 prévu le{" "}
          <strong>09 août 2026</strong> à Kinshasa (RDC).
        </p>
      </section>

      <section>
        <h2>2. Acceptation</h2>
        <p>
          En accédant au Site ou en soumettant une inscription, vous acceptez sans réserve les
          présentes conditions. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser
          le Site ni le formulaire d&apos;inscription.
        </p>
      </section>

      <section>
        <h2>3. Service d&apos;inscription</h2>
        <p>
          Le formulaire d&apos;inscription permet de manifester votre intérêt ou votre participation
          à l&apos;événement VAR 4. L&apos;inscription en ligne ne garantit pas automatiquement
          l&apos;accès à l&apos;événement si des places limitées ou des critères d&apos;admission
          s&apos;appliquent ; l&apos;organisateur se réserve le droit de confirmer ou refuser une
          inscription.
        </p>
        <p>
          Vous vous engagez à fournir des informations exactes, complètes et à jour. Toute fausse
          déclaration pourra entraîner l&apos;annulation de votre inscription.
        </p>
      </section>

      <section>
        <h2>4. Connexion Google</h2>
        <p>
          Le bouton <strong>S&apos;inscrire avec Google</strong> est un service optionnel
          d&apos;authentification fourni par Google LLC. En l&apos;utilisant, vous acceptez
          également les conditions d&apos;utilisation de Google applicables à OAuth.
        </p>
        <p>
          L&apos;organisateur n&apos;est pas responsable des interruptions, modifications ou
          indisponibilités du service Google. Les données obtenues via Google sont traitées
          conformément à notre{" "}
          <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
        </p>
      </section>

      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des éléments du Site (textes, visuels, logos, charte graphique, vidéos,
          structure) est protégé par le droit de la propriété intellectuelle. Toute reproduction,
          représentation ou exploitation non autorisée est interdite sans accord préalable écrit de
          l&apos;organisateur.
        </p>
      </section>

      <section>
        <h2>6. Comportement des utilisateurs</h2>
        <p>Il est interdit de :</p>
        <ul>
          <li>utiliser le Site à des fins illégales ou frauduleuses ;</li>
          <li>tenter d&apos;accéder de manière non autorisée aux systèmes ou données ;</li>
          <li>transmettre des contenus offensants, diffamatoires ou contraires à l&apos;ordre public ;</li>
          <li>usurper l&apos;identité d&apos;un tiers lors de l&apos;inscription.</li>
        </ul>
      </section>

      <section>
        <h2>7. Disponibilité du Site</h2>
        <p>
          L&apos;organisateur s&apos;efforce d&apos;assurer la disponibilité du Site et du service
          d&apos;inscription, sans garantie d&apos;accès ininterrompu. Des opérations de
          maintenance, des pannes techniques ou des cas de force majeure peuvent suspendre
          temporairement le service.
        </p>
      </section>

      <section>
        <h2>8. Limitation de responsabilité</h2>
        <p>
          Dans les limites autorisées par la loi, l&apos;organisateur ne saurait être tenu
          responsable des dommages indirects liés à l&apos;utilisation du Site. Les informations
          publiées sur le Site (dates, programme, intervenants) sont susceptibles d&apos;être
          modifiées ; l&apos;organisateur s&apos;efforcera d&apos;en informer les inscrits dans les
          meilleurs délais.
        </p>
      </section>

      <section>
        <h2>9. Événement et sécurité</h2>
        <p>
          La participation à l&apos;événement VAR 4 implique le respect du règlement intérieur du
          lieu, des consignes de sécurité et des décisions des organisateurs sur place. L&apos;accès
          peut être refusé en cas de non-respect de ces règles.
        </p>
      </section>

      <section>
        <h2>10. Liens externes</h2>
        <p>
          Le Site peut contenir des liens vers des sites tiers (réseaux sociaux, partenaires).
          L&apos;organisateur n&apos;exerce aucun contrôle sur ces sites et décline toute
          responsabilité quant à leur contenu ou leurs pratiques.
        </p>
      </section>

      <section>
        <h2>11. Droit applicable</h2>
        <p>
          Les présentes conditions sont régies par le droit de la République Démocratique du Congo,
          sous réserve des dispositions impératives applicables. En cas de litige, les parties
          s&apos;efforceront de trouver une solution amiable avant toute action judiciaire.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Pour toute question relative aux présentes conditions :{" "}
          <a href="mailto:duvirtuelaureel@miteka.io">duvirtuelaureel@miteka.io</a>
        </p>
        <p>
          Adresse : 67 Boulevard du 30 Juin &amp; Avenue TSF, Immeuble Golf Appartement 21,
          Kinshasa-Gombe, RDC.
        </p>
      </section>

      <section>
        <h2>13. Modifications</h2>
        <p>
          L&apos;organisateur se réserve le droit de modifier les présentes conditions à tout
          moment. La version en vigueur est celle publiée sur cette page, avec indication de la date
          de mise à jour.
        </p>
      </section>
    </LegalPageShell>
  );
}
