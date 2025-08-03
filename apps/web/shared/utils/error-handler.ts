import { toast } from "sonner";

/**
 * Error handler utility that only logs in development environment
 * @param error The error object to handle
 * @param context Optional context about where the error occurred
 * @param metadata Optional additional metadata to log with the error
 */
export function handleError(
  error: unknown,
  context?: string,
  metadata: Record<string, any> = {},
) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  if (isDevelopment) {
    console.error(
      `[Error${context ? ` in ${context}` : ""}]`,
      error,
      Object.keys(metadata).length > 0 ? metadata : "",
    );
  }

  // Show toast with appropriate message
  toast.error(
    isDevelopment
      ? errorMessage
      : `Failed to ${context || "complete operation"}`,
  );

  // Return a standardized error response
  return {
    success: false,
    message: errorMessage,
    ...(isDevelopment && {
      error: error instanceof Error ? error.stack : error,
    }),
  };
}
