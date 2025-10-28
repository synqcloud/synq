import Image from "next/image";
import { Store, User, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Badge,
} from "@synq/ui/component";
import { cn } from "@synq/ui/utils";

interface MarketplaceIconProps {
  marketplace: string;
  className?: string;
  isIntegration?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
}

export function MarketplaceIcon({
  marketplace,
  className = "",
  isIntegration = false,
  showLabel = false,
  showTooltip = true,
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
      return "/eBay.svg";
    } else if (lowerMarketplace.includes("shopify")) {
      return "/shopify.svg";
    } else if (lowerMarketplace.includes("cardtrader")) {
      return "/cardtrader.svg";
    } else if (lowerMarketplace.includes("amazon")) {
      return "/amazon.svg";
    } else if (lowerMarketplace.includes("manapool")) {
      return "/manapool.svg";
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

  const renderFallbackIcon = () => {
    if (!showLabel) {
      return (
        <div className={cn("flex items-center gap-1", className)}>
          <div className="w-6 h-6 bg-card border border-border rounded-md flex items-center justify-center shadow-sm relative">
            <span className="text-[10px] font-bold text-muted-foreground/70">
              {marketplace.charAt(0).toUpperCase()}
            </span>
            {!isIntegration && (
              <div className="absolute -inset-0.5 bg-muted-foreground/10 rounded-md blur-sm -z-10" />
            )}
          </div>
          {isIntegration && (
            <div className="relative">
              <Zap className="h-4 w-4 text-primary/70" />
              <div className="absolute -inset-1 bg-primary/10 rounded-full blur-sm -z-10" />
            </div>
          )}
        </div>
      );
    }
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span
          className={`text-xs font-medium tracking-[-0.01em] ${
            isIntegration ? "text-primary" : "text-muted-foreground/80"
          }`}
        >
          {marketplace}
        </span>
        {isIntegration && (
          <div className="relative">
            <Zap className="h-4 w-4 text-primary/70" />
            <div className="absolute -inset-1 bg-primary/10 rounded-full blur-sm -z-10" />
          </div>
        )}
      </div>
    );
  };

  if (!iconSrc && !lucideIcon) {
    const content = renderFallbackIcon();
    return showTooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 rounded-lg transition-all duration-200">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          <div className="flex items-center gap-1.5">
            {marketplace}
            {isIntegration && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-primary">Connected</span>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    ) : (
      content
    );
  }

  const renderMainIcon = () => (
    <div
      className={cn(
        "flex items-center",
        showLabel ? "gap-2" : "gap-1",
        className,
      )}
    >
      {iconSrc ? (
        <div
          className={cn(
            "w-6 h-6 relative rounded-md overflow-hidden shadow-sm border bg-card",
            isIntegration
              ? "border-primary/50 ring-1 ring-primary/20"
              : "border-border",
          )}
        >
          <Image
            src={iconSrc}
            alt={marketplace}
            width={24}
            height={24}
            className="object-contain p-0.5"
          />
          {isIntegration ? (
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-transparent rounded-md blur-sm -z-10" />
          ) : (
            <div className="absolute -inset-0.5 bg-muted-foreground/8 rounded-md blur-sm -z-10" />
          )}
        </div>
      ) : lucideIcon === "store" ? (
        <div
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center border shadow-sm bg-card relative",
            isIntegration
              ? "border-primary/50 text-primary"
              : "border-border text-muted-foreground",
          )}
        >
          <Store className="w-3.5 h-3.5" />
          {!isIntegration && (
            <div className="absolute -inset-0.5 bg-muted-foreground/8 rounded-md blur-sm -z-10" />
          )}
        </div>
      ) : lucideIcon === "user" ? (
        <div
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center border shadow-sm bg-card relative",
            isIntegration
              ? "border-primary/50 text-primary"
              : "border-border text-muted-foreground",
          )}
        >
          <User className="w-3.5 h-3.5" />
          {!isIntegration && (
            <div className="absolute -inset-0.5 bg-muted-foreground/8 rounded-md blur-sm -z-10" />
          )}
        </div>
      ) : null}
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-medium tracking-[-0.01em]",
              isIntegration ? "text-primary" : "text-muted-foreground/80",
            )}
          >
            {marketplace}
          </span>
          {isIntegration && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] font-medium bg-primary/10 text-primary/80 border-primary/20"
            >
              <Zap className="w-2.5 h-2.5 mr-0.5" />
              Connected
            </Badge>
          )}
        </div>
      )}
      {!showLabel && isIntegration && (
        <div className="relative">
          <Zap className="h-4 w-4 text-primary/70" />
          <div className="absolute -inset-1 bg-primary/10 rounded-full blur-sm -z-10" />
        </div>
      )}
    </div>
  );

  const content = renderMainIcon();
  return showTooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {marketplace}
        {isIntegration && " (Connected)"}
      </TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}
