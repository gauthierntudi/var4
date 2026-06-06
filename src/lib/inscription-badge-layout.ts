/** Badge portrait VAR4 — 650 × 1004 px. Coordonnées fournies en (Y, X). */
export const BADGE_WIDTH = 650;
export const BADGE_HEIGHT = 1004;
export const BADGE_FRAME_SRC = "/img/frames/newframeok.png";

export type BadgeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const BADGE_LAYOUT = {
  /** Cercle photo — repères newframe : TL(194,150) TR(194,503) BL(544,150) BR(544,503). */
  photo: { x: 150, y: 194, width: 353, height: 350 } satisfies BadgeRect,
  name: { x: 69, y: 584, width: 517, height: 60 } satisfies BadgeRect,
  title: { x: 69, y: 640, width: 517, height: 33 } satisfies BadgeRect,
} as const;
