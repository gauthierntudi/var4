export const INSCRIPTION_FEED_EVENT = "var4:inscription-created";

export type InscriptionFeedItem = {
  id: string;
  fullName: string;
  city: string;
  photoUrl: string | null;
};

export function shuffleInscriptionFeed<T extends { id: string }>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function getInscriptionInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function randomFeedDelay(minMs: number, maxMs: number): number {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}
