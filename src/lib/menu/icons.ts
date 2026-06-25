import {
  Beef,
  Pizza,
  Sandwich,
  GlassWater,
  CakeSlice,
  Drumstick,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/** Glyphs lucide disponíveis para categorias (o gestor escolhe pelo nome). */
const ICONS: Record<string, LucideIcon> = {
  Beef,
  Pizza,
  Sandwich,
  GlassWater,
  CakeSlice,
  Drumstick,
  UtensilsCrossed,
};

export function iconByName(name: string): LucideIcon {
  return ICONS[name] ?? UtensilsCrossed;
}

export const ICON_NAMES = Object.keys(ICONS);
