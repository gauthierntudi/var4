import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité — VAR 4",
  description:
    "Politique de confidentialité du site VAR 4 et du formulaire d'inscription, incluant l'authentification Google.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageShell
      title="Politique de confidentialité"
      updatedAt="28 mai 2026"
      headerImage="/img/img03.jpg"
    >
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Le site <strong>VAR 4 — Du Virtuel au Réel</strong> est édité par{" "}
          <strong>Team Booster Digital | Miteka Advertising</strong>, 67 Boulevard du 30 Juin &amp;
          Avenue TSF, Immeuble Golf Appartement 21, Kinshasa-Gombe, République Démocratique du
          Congo.
        </p>
        <p>
          Contact :{" "}
          <a href="mailto:duvirtuelaureel@miteka.io">duvirtuelaureel@miteka.io</a>
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>Dans le cadre de l&apos;inscription à l&apos;événement VAR 4, nous pouvons collecter :</p>
        <ul>
          <li>nom complet ;</li>
          <li>adresse e-mail ;</li>
          <li>ville de résidence ;</li>
          <li>pseudo et lien de profil sur un réseau social ;</li>
          <li>réseau social préféré ;</li>
          <li>photographie de profil (upload ou importée via Google) ;</li>
          <li>date et heure d&apos;inscription.</li>
        </ul>
      </section>

      <section>
        <h2>3. Connexion avec Google</h2>
        <p>
          Si vous choisissez <strong>S&apos;inscrire avec Google</strong>, nous utilisons le service
          Google OAuth pour accéder, avec votre consentement, aux informations de base de votre
          compte Google : nom, adresse e-mail et photo de profil.
        </p>
        <p>
          Ces données servent uniquement à préremplir le formulaire d&apos;inscription. Google
          traite vos données conformément à sa propre politique :{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            policies.google.com/privacy
          </a>
          .
        </p>
        <p>
          Nous ne recevons pas votre mot de passe Google et n&apos;accédons pas à l&apos;ensemble
          de votre compte Google.
        </p>
      </section>

      <section>
        <h2>4. Finalités du traitement</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>enregistrer et gérer votre inscription à l&apos;événement VAR 4 ;</li>
          <li>vous contacter en cas de besoin (informations pratiques, programme, modifications) ;</li>
          <li>assurer l&apos;organisation logistique de l&apos;événement ;</li>
          <li>améliorer l&apos;expérience utilisateur du site.</li>
        </ul>
      </section>

      <section>
        <h2>5. Base légale</h2>
        <p>
          Le traitement repose sur votre consentement lors de la soumission du formulaire
          d&apos;inscription et, le cas échéant, sur l&apos;exécution des mesures précontractuelles
          liées à votre participation à l&apos;événement.
        </p>
      </section>

      <section>
        <h2>6. Hébergement et sous-traitants</h2>
        <p>Vos données peuvent être traitées par les prestataires suivants :</p>
        <ul>
          <li>
            <strong>Vercel</strong> — hébergement du site web ;
          </li>
          <li>
            <strong>Neon</strong> — base de données PostgreSQL (données d&apos;inscription) ;
          </li>
          <li>
            <strong>Amazon Web Services (S3)</strong> — stockage sécurisé des photos ;
          </li>
          <li>
            <strong>Google</strong> — authentification OAuth (si vous utilisez cette option).
          </li>
        </ul>
        <p>
          Ces prestataires sont sélectionnés pour leurs garanties de sécurité et ne traitent vos
          données que sur nos instructions et dans la limite nécessaire au service.
        </p>
      </section>

      <section>
        <h2>7. Durée de conservation</h2>
        <p>
          Les données d&apos;inscription sont conservées pendant la durée nécessaire à
          l&apos;organisation de l&apos;événement VAR 4, puis archivées ou supprimées dans un délai
          raisonnable après la clôture de l&apos;édition, sauf obligation légale contraire.
        </p>
      </section>

      <section>
        <h2>8. Vos droits</h2>
        <p>
          Conformément à la réglementation applicable, vous pouvez demander l&apos;accès, la
          rectification ou la suppression de vos données, ainsi que la limitation ou l&apos;opposition
          au traitement lorsque la loi le permet.
        </p>
        <p>
          Pour exercer vos droits :{" "}
          <a href="mailto:duvirtuelaureel@miteka.io">duvirtuelaureel@miteka.io</a>
        </p>
      </section>

      <section>
        <h2>9. Cookies et traceurs</h2>
        <p>
          Le site peut utiliser des cookies techniques strictement nécessaires à son fonctionnement.
          La connexion Google est gérée par les services Google et peut impliquer des cookies tiers
          lors de l&apos;authentification.
        </p>
      </section>

      <section>
        <h2>10. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées (connexion
          chiffrée HTTPS, accès restreint aux bases de données, stockage cloud sécurisé) pour
          protéger vos données contre l&apos;accès non autorisé, la perte ou l&apos;altération.
        </p>
      </section>

      <section>
        <h2>11. Modifications</h2>
        <p>
          Cette politique peut être mise à jour. La date de dernière mise à jour figure en haut de
          page. Nous vous invitons à la consulter régulièrement. Voir aussi nos{" "}
          <Link href="/conditions-utilisation">conditions d&apos;utilisation</Link>.
        </p>
      </section>
    </LegalPageShell>
  );
}
