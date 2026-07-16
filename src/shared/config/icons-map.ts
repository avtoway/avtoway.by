import {
  IconYouTube,
  IconCar,
  IconCheckCircle,
  IconDollar,
} from "@/shared/ui/icons";
import type { ComponentType } from "react";

export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  youtube: IconYouTube,
  car: IconCar,
  "check-circle": IconCheckCircle,
  dollar: IconDollar,
} as const;

export function getServiceIcon(iconName: string): ComponentType<{ className?: string }> {
  return ICON_MAP[iconName] ?? ICON_MAP.youtube!;
}
