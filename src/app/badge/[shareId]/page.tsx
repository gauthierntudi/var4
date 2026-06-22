import "@/styles/badge-share.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBadgeShareImageUrl,
  getBadgeSharePageUrl,
  isValidBadgeShareId,
  VAR4_BADGE_SHARE_TEXT,
} from "@/lib/badge-share";

type BadgeSharePageProps = {
  params: Promise<{ shareId: string }>;
};

export async function generateMetadata({ params }: BadgeSharePageProps): Promise<Metadata> {
  const { shareId } = await params;

  if (!isValidBadgeShareId(shareId)) {
    return {
      title: "Badge VAR 4",
    };
  }

  const imageUrl = getBadgeShareImageUrl(shareId);
  const pageUrl = getBadgeSharePageUrl(shareId);
  const title = "Mon badge VAR 4";

  return {
    title,
    description: VAR4_BADGE_SHARE_TEXT,
    metadataBase: new URL(getBadgeSharePageUrl(shareId)),
    openGraph: {
      title,
      description: VAR4_BADGE_SHARE_TEXT,
      url: pageUrl,
      siteName: "VAR 4",
      type: "website",
      locale: "fr_CD",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 650,
              height: 1004,
              alt: title,
              type: "image/png",
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: VAR4_BADGE_SHARE_TEXT,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BadgeSharePage({ params }: BadgeSharePageProps) {
  const { shareId } = await params;

  if (!isValidBadgeShareId(shareId)) {
    notFound();
  }

  const imageUrl = getBadgeShareImageUrl(shareId);

  if (!imageUrl) {
    notFound();
  }

  return (
    <main className="badge-share-page">
      <div className="badge-share-page__inner">
        <p className="badge-share-page__eyebrow">VAR 4</p>
        <h1 className="badge-share-page__title">Mon badge VAR 4</h1>
        <p className="badge-share-page__text">{VAR4_BADGE_SHARE_TEXT}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Badge VAR 4"
          className="badge-share-page__image"
          width={650}
          height={1004}
        />
      </div>
    </main>
  );
}
