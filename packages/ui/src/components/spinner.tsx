import { cn } from "#lib/utils.js";
import { memo } from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?:
    | "destructive"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info";
}

export const Spinner = memo(
  ({ className, size = "md", variant = "primary" }: SpinnerProps) => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-6 w-6",
    };

    const variantsClasses = {
      destructive: "text-destructive",
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      warning: "text-warning",
      info: "text-info",
    };

    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantsClasses[variant],
          )}
        />
      </div>
    );
  },
);

Spinner.displayName = "Spinner";
