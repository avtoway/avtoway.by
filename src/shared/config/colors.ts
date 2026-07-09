export const COLORS = {
  primary: "#ef4444",
  primaryDark: "#dc2626",
  secondary: "#1e293b",
  accent: "#f59e0b",
  accent2: "#3b82f6",
  green: "#10b981",
  pink: "#ec4899",
  violet: "#8b5cf6",
  surface: "#0d0d0d",
  elevated: "#141414",
  background: "#030303",
  foreground: "#fafafa",
} as const;

export const COLOR_MAP: Record<string, [string, string]> = {
  [COLORS.primary]: ["239,68,68", "rgba(239,68,68,0.15)"],
  [COLORS.accent2]: ["59,130,246", "rgba(59,130,246,0.15)"],
  [COLORS.green]: ["16,185,129", "rgba(16,185,129,0.15)"],
  [COLORS.accent]: ["245,158,11", "rgba(245,158,11,0.15)"],
};

export const SECTION_COLORS = {
  hero: `rgba(239,68,68,0.12)`,
  story: `rgba(59,130,246,0.10)`,
  timeline: `rgba(245,158,11,0.10)`,
  social: `rgba(16,185,129,0.10)`,
} as const;
