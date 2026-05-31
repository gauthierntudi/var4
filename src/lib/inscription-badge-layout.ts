/** Badge portrait VAR4 — 650 × 1004 px. Coordonnées fournies en (Y, X). */
export const BADGE_WIDTH = 650;
export const BADGE_HEIGHT = 1004;
export const BADGE_FRAME_SRC = "/img/frames/badge-portrait-frame.png";

export type BadgeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const BADGE_LAYOUT = {
  photo: { x: 148, y: 211, width: 350, height: 350 } satisfies BadgeRect,
  name: { x: 69, y: 584, width: 517, height: 60 } satisfies BadgeRect,
  title: { x: 69, y: 660, width: 517, height: 33 } satisfies BadgeRect,
} as const;
