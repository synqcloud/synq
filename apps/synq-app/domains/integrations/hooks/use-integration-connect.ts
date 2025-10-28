import { useState } from "react";

interface ConnectOptions {
  endpoint: string;
  payload: Record<string, unknown>;
  onSuccess?: () => void | Promise<void>;
}

export const useIntegrationConnect = () => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const connect = async (options: ConnectOptions) => {
    setConnecting(true);
    setError("");

    try {
      const response = await fetch(options.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options.payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect");
      }

      // If redirect URL is provided (e.g., OAuth flow), redirect
      if (data.url) {
        window.location.href = data.url;
      }

      // Otherwise call success callback
      if (options.onSuccess) {
        await options.onSuccess();
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection failed";
      setError(errorMessage);
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  return { connect, connecting, error, setError };
};
