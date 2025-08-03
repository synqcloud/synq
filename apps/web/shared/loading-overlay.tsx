import { Loader2 } from "lucide-react";
import { cn } from "@synq/ui/utils";

interface LoadingOverlayProps {
  isLoading?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingOverlay({
  isLoading = true,
  className,
  size = "md",
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
    </div>
  );
}
