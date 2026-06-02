import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Endpoint pour la suppression des données Facebook (Data Deletion Callback)
 * Requis par Meta pour les applications utilisant Facebook Login.
 * 
 * URL à configurer dans le Dashboard Meta : https://votre-domaine.com/api/auth/facebook/deletion
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appSecret) {
      console.error("FACEBOOK_APP_SECRET is not configured in .env");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 1. Parser le signed_request (format: signature.payload)
    const [encodedSig, payload] = signedRequest.split(".");
    
    // 2. Vérifier la signature
    const hmac = crypto.createHmac("sha256", appSecret);
    hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
    const expectedSig = hmac.digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    if (encodedSig !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. Décoder le payload
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );

    const userId = data.user_id;
    console.log(`Demande de suppression reçue pour l'utilisateur Facebook : ${userId}`);

    // Ici, vous pourriez ajouter une logique pour marquer les données de cet utilisateur 
    // comme étant à supprimer dans votre base de données si nécessaire.
    // Pour VAR 4, les inscriptions sont souvent basées sur l'email.

    // 4. Répondre selon le format exigé par Meta
    // confirmation_code: un identifiant unique pour le suivi de la demande
    // url: une page où l'utilisateur peut vérifier le statut (optionnel)
    const confirmationCode = `del_${userId}_${Date.now()}`;
    const statusUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/politique-de-confidentialite`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });

  } catch (error) {
    console.error("Error handling Facebook deletion request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
