"use client";
import Image from "next/image";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodImageProps {
  name: string;
  gradient: string;
  imageUrl?: string;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
  sizes?: string;
}

/**
 * Foto do prato sobre um gradiente apetitoso. Se a imagem falhar, o gradiente +
 * glyph da categoria permanecem — a UI nunca mostra imagem quebrada.
 */
export function FoodImage({
  name,
  gradient,
  imageUrl,
  icon: Icon,
  className,
  iconClassName,
  sizes = "200px",
}: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: gradient }}
    >
      {imageUrl && !failed && (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {(failed || !imageUrl) && Icon && (
        <div className="absolute inset-0 grid place-items-center">
          <Icon
            className={cn("text-white/70", iconClassName)}
            strokeWidth={1.2}
          />
        </div>
      )}
    </div>
  );
}
