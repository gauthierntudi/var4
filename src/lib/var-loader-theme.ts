export const VAR_LOADER_THEMES = [
  {
    base: "#193e6c",
    shade: "#122f52",
    accent: "#77deb9",
    track: "rgba(255, 255, 255, 0.16)",
    label: "rgba(255, 255, 255, 0.82)",
  },
  {
    base: "#4c98d2",
    shade: "#3a87c0",
    accent: "#d1f474",
    track: "rgba(255, 255, 255, 0.2)",
    label: "rgba(255, 255, 255, 0.9)",
  },
  {
    base: "#77deb9",
    shade: "#5fd4a8",
    accent: "#193e6c",
    track: "rgba(25, 62, 108, 0.14)",
    label: "rgba(25, 62, 108, 0.82)",
  },
  {
    base: "#8579ec",
    shade: "#6f65d4",
    accent: "#d1f474",
    track: "rgba(255, 255, 255, 0.18)",
    label: "rgba(255, 255, 255, 0.9)",
  },
  {
    base: "#ea7637",
    shade: "#d46328",
    accent: "#193e6c",
    track: "rgba(255, 255, 255, 0.2)",
    label: "rgba(255, 255, 255, 0.9)",
  },
  {
    base: "#d1f474",
    shade: "#b8d95a",
    accent: "#193e6c",
    track: "rgba(25, 62, 108, 0.12)",
    label: "rgba(25, 62, 108, 0.78)",
  },
] as const;

export type VarLoaderTheme = (typeof VAR_LOADER_THEMES)[number];

export const VAR_LOADER_PROGRESS_RADIUS = 54;
export const VAR_LOADER_PROGRESS_CIRCUMFERENCE = 2 * Math.PI * VAR_LOADER_PROGRESS_RADIUS;

export function pickRandomVarLoaderTheme() {
  return VAR_LOADER_THEMES[Math.floor(Math.random() * VAR_LOADER_THEMES.length)]!;
}
