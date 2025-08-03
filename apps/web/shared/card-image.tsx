import Image from "next/image";
import { BookOpen, ImageIcon } from "lucide-react";
import React, { useMemo } from "react";

export type Rarity = string;

function getContrastColor(hex: string) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#") || hex.length < 7)
    return "#fff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000" : "#fff";
}

interface CardImageProps {
  src: string | null;
  alt: string;
  rarity?: Rarity;
  showBadge?: boolean;
  className?: string;
  sizes?: string;
  fallbackIcon?: "book" | "image";
  borderColor?: string;
  badgePosition?: "top-right" | "bottom-left";
}

const CardImageComponent = ({
  src,
  alt,
  rarity,
  showBadge = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallbackIcon = "image",
  borderColor,
  badgePosition = "bottom-left",
}: CardImageProps) => {
  // Memoize contrast color and badge style for performance
  const badgeStyle = useMemo(() => {
    if (!borderColor) return undefined;
    return {
      background: borderColor,
      color: getContrastColor(borderColor),
      borderColor: borderColor,
      minWidth: 18,
      justifyContent: "center",
      fontFamily: "inherit",
      letterSpacing: 0.2,
      textTransform: "uppercase" as const,
    };
  }, [borderColor]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {borderColor && (
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-lg"
          style={{ border: `2px solid ${borderColor}` }}
        />
      )}
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
          sizes={sizes}
          placeholder="empty"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-xl border border-border">
          {fallbackIcon === "book" ? (
            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
          ) : (
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          )}
        </div>
      )}
      {showBadge && rarity && borderColor && (
        <span
          className={`absolute z-30 flex items-center gap-1 px-1 py-0.5 rounded-full text-[8px] font-semibold tracking-wide border shadow ${
            badgePosition === "top-right" ? "top-2 right-2" : "bottom-2 left-2"
          }`}
          style={badgeStyle}
        >
          {rarity}
        </span>
      )}
    </div>
  );
};

export const CardImage = React.memo(CardImageComponent);
