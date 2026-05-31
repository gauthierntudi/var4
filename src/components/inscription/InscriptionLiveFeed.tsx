"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { formatInscriptionDisplayName } from "@/lib/inscription-badge-name";
import {
  getInscriptionInitials,
  INSCRIPTION_FEED_EVENT,
  randomFeedDelay,
  shuffleInscriptionFeed,
  type InscriptionFeedItem,
} from "@/lib/inscription-feed";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const FEED_URL = "/api/inscriptions/feed";
const SHOW_MS = 4800;
const INITIAL_DELAY_MS = 3200;
const POLL_MS = 90_000;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isModalOpen() {
  return document.documentElement.classList.contains("inscription-modal-open");
}

export function InscriptionLiveFeed() {
  const capsuleRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const cityRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const [current, setCurrent] = useState<InscriptionFeedItem | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const poolRef = useRef<InscriptionFeedItem[]>([]);
  const playlistRef = useRef<InscriptionFeedItem[]>([]);
  const loopActiveRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const upsertPool = useCallback((items: InscriptionFeedItem[]) => {
    if (items.length === 0) return;

    const byId = new Map(poolRef.current.map((item) => [item.id, item]));
    items.forEach((item) => {
      const existing = byId.get(item.id);
      const photoUrl =
        item.photoUrl && !item.photoUrl.startsWith("blob:")
          ? item.photoUrl
          : (existing?.photoUrl ?? item.photoUrl);

      byId.set(item.id, {
        id: item.id,
        fullName: item.fullName,
        city: item.city,
        photoUrl: photoUrl ?? null,
      });
    });
    poolRef.current = Array.from(byId.values());

    const newItems = items.filter(
      (item) => !playlistRef.current.some((queued) => queued.id === item.id),
    );

    if (newItems.length > 0) {
      playlistRef.current = [...shuffleInscriptionFeed(newItems), ...playlistRef.current];
    }
  }, []);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await fetch(FEED_URL, { cache: "no-store" });
      if (!response.ok) return;

      const data = (await response.json()) as { items?: InscriptionFeedItem[] };
      if (Array.isArray(data.items) && data.items.length > 0) {
        upsertPool(data.items);
      }
    } catch {
      // Silencieux — le feed reste optionnel.
    }
  }, [upsertPool]);

  const takeNextItem = useCallback((): InscriptionFeedItem | null => {
    if (playlistRef.current.length === 0 && poolRef.current.length > 0) {
      playlistRef.current = shuffleInscriptionFeed(poolRef.current);
    }

    if (playlistRef.current.length === 0) {
      void fetchFeed();
      return null;
    }

    return playlistRef.current.shift() ?? null;
  }, [fetchFeed]);

  const animateIn = useCallback(async () => {
    const capsule = capsuleRef.current;
    const avatar = avatarRef.current;
    const name = nameRef.current;
    const city = cityRef.current;
    const badge = badgeRef.current;

    if (!capsule) return;

    capsule.classList.add("is-glowing");

    if (prefersReducedMotion) {
      gsap.set(capsule, { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" });
      if (avatar) gsap.set(avatar, { scale: 1, rotation: 0 });
      if (name) gsap.set(name, { opacity: 1, y: 0 });
      if (city) gsap.set(city, { opacity: 1, y: 0 });
      if (badge) gsap.set(badge, { opacity: 1, scale: 1 });
      return;
    }

    gsap.set(capsule, { opacity: 0, x: -72, y: 18, scale: 0.88, filter: "blur(10px)" });
    if (avatar) gsap.set(avatar, { scale: 0.4, rotation: -120 });
    if (name) gsap.set(name, { opacity: 0, y: 14 });
    if (city) gsap.set(city, { opacity: 0, y: 10 });
    if (badge) gsap.set(badge, { opacity: 0, scale: 0.7 });

    await gsap
      .timeline()
      .to(capsule, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.95,
        ease: "power4.out",
      })
      .to(
        avatar,
        {
          scale: 1,
          rotation: 0,
          duration: 0.75,
          ease: "back.out(1.8)",
        },
        "-=0.72",
      )
      .to(
        [name, city],
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.5",
      )
      .to(
        badge,
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "back.out(2)",
        },
        "-=0.35",
      );

    gsap.to(capsule, {
      y: -4,
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: 1,
    });
  }, [prefersReducedMotion]);

  const animateOut = useCallback(async () => {
    const capsule = capsuleRef.current;
    const name = nameRef.current;
    const city = cityRef.current;
    const badge = badgeRef.current;

    if (!capsule) return;

    capsule.classList.remove("is-glowing");

    if (prefersReducedMotion) {
      gsap.set(capsule, { opacity: 0 });
      return;
    }

    await gsap
      .timeline()
      .to([name, city, badge], {
        opacity: 0,
        y: -6,
        duration: 0.28,
        stagger: 0.04,
        ease: "power2.in",
      })
      .to(
        capsule,
        {
          opacity: 0,
          y: -18,
          x: 24,
          scale: 0.94,
          filter: "blur(6px)",
          duration: 0.62,
          ease: "power3.in",
        },
        "-=0.08",
      );
  }, [prefersReducedMotion]);

  useEffect(() => {
    void fetchFeed();

    const onCreated = (event: Event) => {
      const detail = (event as CustomEvent<InscriptionFeedItem>).detail;
      if (!detail?.id) return;

      upsertPool([detail]);
      playlistRef.current = [detail, ...playlistRef.current.filter((item) => item.id !== detail.id)];
    };

    window.addEventListener(INSCRIPTION_FEED_EVENT, onCreated);
    const pollId = window.setInterval(() => {
      void fetchFeed();
    }, POLL_MS);

    return () => {
      window.removeEventListener(INSCRIPTION_FEED_EVENT, onCreated);
      window.clearInterval(pollId);
    };
  }, [fetchFeed, upsertPool]);

  useEffect(() => {
    if (loopActiveRef.current) return;
    loopActiveRef.current = true;

    let cancelled = false;

    const runLoop = async () => {
      await sleep(INITIAL_DELAY_MS);

      while (!cancelled) {
        if (isModalOpen()) {
          await sleep(400);
          continue;
        }

        const next = takeNextItem();
        if (!next) {
          await sleep(1200);
          continue;
        }

        setCurrent(next);
        setPhotoFailed(false);
        await sleep(32);
        await animateIn();
        await sleep(prefersReducedMotion ? SHOW_MS + 800 : SHOW_MS);
        await animateOut();
        setCurrent(null);
        await sleep(randomFeedDelay(2200, 4600));
      }
    };

    void runLoop();

    return () => {
      cancelled = true;
      loopActiveRef.current = false;
    };
  }, [animateIn, animateOut, prefersReducedMotion, takeNextItem]);

  if (!current) return null;

  const initials = getInscriptionInitials(current.fullName);
  const displayName = formatInscriptionDisplayName(current.fullName);
  const showPhoto = Boolean(current.photoUrl) && !photoFailed;

  return (
    <div className="inscription-live-feed" aria-live="polite" aria-atomic="true">
      <article ref={capsuleRef} className="inscription-live-feed__capsule">
        <div ref={avatarRef} className="inscription-live-feed__avatar">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.photoUrl!}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <span className="inscription-live-feed__initials">{initials || "?"}</span>
          )}
        </div>

        <div className="inscription-live-feed__body">
          <p ref={nameRef} className="inscription-live-feed__name">
            {displayName}
          </p>
          <p ref={cityRef} className="inscription-live-feed__city">
            {current.city}
          </p>
        </div>

        <span ref={badgeRef} className="inscription-live-feed__badge">
          Inscrit·e
        </span>
      </article>
    </div>
  );
}
