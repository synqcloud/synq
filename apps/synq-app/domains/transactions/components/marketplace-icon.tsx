import Image from "next/image";
import { Store, User, Zap } from "lucide-react";

interface MarketplaceIconProps {
  marketplace: string;
  className?: string;
  isIntegration?: boolean;
}

export function MarketplaceIcon({
  marketplace,
  className = "",
  isIntegration = false,
}: MarketplaceIconProps) {
  const getMarketplaceIcon = (marketplace: string) => {
    const lowerMarketplace = marketplace.toLowerCase();
    if (lowerMarketplace.includes("tcgplayer")) {
      return "/tcgplayer.svg";
    } else if (lowerMarketplace.includes("cardmarket")) {
      return "/cardmarket.svg";
    } else if (lowerMarketplace.includes("whatnot")) {
      return "/whatnot.svg";
    } else if (lowerMarketplace.includes("ebay")) {
      return "/ebay.svg";
    } else if (lowerMarketplace.includes("cardtrader")) {
      return "/cardtrader.svg";
    }
    return null;
  };

  const getLucideIcon = (marketplace: string) => {
    const lowerMarketplace = marketplace.toLowerCase();
    if (
      lowerMarketplace.includes("in-store") ||
      lowerMarketplace.includes("store")
    ) {
      return "store";
    } else if (
      lowerMarketplace.includes("person") ||
      lowerMarketplace.includes("customer") ||
      lowerMarketplace.includes("manual")
    ) {
      return "user";
    }
    return null;
  };

  const iconSrc = getMarketplaceIcon(marketplace);
  const lucideIcon = getLucideIcon(marketplace);

  if (!iconSrc && !lucideIcon) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span
          className={`text-xs font-medium tracking-[-0.01em] ${
            isIntegration ? "text-primary" : "text-muted-foreground/80"
          }`}
        >
          {marketplace}
        </span>
        {isIntegration && <Zap className="h-3 w-3 text-primary/70" />}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {iconSrc ? (
        <div
          className={`w-4 h-4 relative ${
            isIntegration ? "ring-1 ring-primary/50 rounded-sm" : ""
          }`}
        >
          <Image
            src={iconSrc}
            alt={marketplace}
            width={16}
            height={16}
            className="object-contain"
          />
        </div>
      ) : lucideIcon === "store" ? (
        <Store
          className={`w-4 h-4 ${
            isIntegration ? "text-primary/80" : "text-muted-foreground/80"
          }`}
        />
      ) : lucideIcon === "user" ? (
        <User
          className={`w-4 h-4 ${
            isIntegration ? "text-primary/80" : "text-muted-foreground/80"
          }`}
        />
      ) : null}
      <span
        className={`text-xs font-medium tracking-[-0.01em] ${
          isIntegration ? "text-primary" : "text-muted-foreground/80"
        }`}
      >
        {marketplace}
      </span>
      {isIntegration && <Zap className="h-3 w-3 text-primary/70" />}
    </div>
  );
}
