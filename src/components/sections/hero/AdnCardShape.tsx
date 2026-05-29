/** Forme carte ADN — viewBox 300×400, encoche circulaire bas-droite (r=42, centre 258,358). */
export const ADN_CARD_VIEWBOX = "0 0 300 400";

export const ADN_CARD_PATH =
  "M 36,0 H 264 Q 300,0 300,36 L 300,358 A 42,42 0 0,1 258,400 H 36 Q 0,400 0,364 L 0,36 Q 0,0 36,0 Z";

type AdnCardShapeProps = {
  className?: string;
  fill?: string;
};

export function AdnCardShape({ className, fill = "currentColor" }: AdnCardShapeProps) {
  return (
    <svg
      className={className}
      viewBox={ADN_CARD_VIEWBOX}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={ADN_CARD_PATH} fill={fill} />
    </svg>
  );
}
