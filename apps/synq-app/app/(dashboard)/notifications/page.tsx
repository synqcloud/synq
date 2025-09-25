// TODO: This file needs refactoring
"use client";
import React, { useRef, useEffect, useCallback } from "react";
import {
  NotificationsService,
  EnrichedNotification,
} from "@synq/supabase/services";
import { toast } from "sonner";
import { Button } from "@synq/ui/component";
import { ExternalLink, CheckCircle, RefreshCw } from "lucide-react";
import { MarketplaceIcon } from "@/features/transactions/components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch notifications query
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationsService.getUserNotifications("client"),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });

  // Safe toast and cache update functions
  const safeToast = useCallback(
    (type: "success" | "error", message: string) => {
      if (isMountedRef.current) {
        toast[type](message);
      }
    },
    [],
  );

  const safeUpdateCache = useCallback((updater: () => void) => {
    if (isMountedRef.current) {
      updater();
    }
  }, []);

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      NotificationsService.markNotificationAsRead("client", id),
    onSuccess: (_, notificationId) => {
      safeToast("success", "Notification marked as completed.");

      // Optimistic removal
      safeUpdateCache(() => {
        queryClient.setQueryData(
          ["notifications"],
          (old: EnrichedNotification[] = []) =>
            old.filter((n) => n.id !== notificationId),
        );
      });

      //  Ensure both queries refresh
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
    },
    onError: (error) => {
      console.error(error);
      safeToast("error", "Failed to mark notification as completed.");
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => NotificationsService.markAllNotificationsAsRead("client"),
    onSuccess: () => {
      safeToast("success", "All notifications marked as completed.");

      safeUpdateCache(() => {
        // Optimistically clear current list
        queryClient.setQueryData(["notifications"], []);
      });

      // Force both queries to re-run
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
    },
    onError: (error) => {
      console.error(error);
      safeToast("error", "Failed to mark all notifications as completed.");
    },
  });

  const handleRefetch = useCallback(() => {
    if (isMountedRef.current) {
      refetch();
    }
  }, [refetch]);

  // Helper function to get card name from notification
  const getCardName = (notification: EnrichedNotification): string => {
    // First try stock-related card
    if (notification.stock?.core_card?.name) {
      return notification.stock.core_card.name;
    }
    // Then try direct core_card reference (for price alerts)
    if (notification.core_card?.name) {
      return notification.core_card.name;
    }
    return "unknown card";
  };

  // Helper function to get notification styling based on type
  const getNotificationStyling = (notification: EnrichedNotification) => {
    switch (notification.notification_type) {
      case "price_alert":
        return {
          borderColor: "border-l-blue-500",
          icon: "📈",
          iconColor: "text-blue-600",
        };
      case "discrepancy_stock":
        return {
          borderColor: "border-l-red-500",
          icon: "⚠️",
          iconColor: "text-red-600",
        };
      default:
        return {
          borderColor: "border-l-gray-300",
          icon: "ℹ️",
          iconColor: "text-gray-500",
        };
    }
  };

  // Helper function to render notification content based on type
  const renderNotificationContent = (notification: EnrichedNotification) => {
    const cardName = getCardName(notification);

    switch (notification.notification_type) {
      case "discrepancy_stock":
        return {
          title: "Stock discrepancy detected",
          body: (
            <>
              <span className="font-medium">{cardName}</span> may need updating.
              {notification.marketplace && (
                <>
                  <span> or update stock in </span>
                  <MarketplaceIcon
                    marketplace={notification.marketplace.name}
                    showLabel
                    isIntegration={false}
                    className="inline-flex items-center align-middle"
                  />
                </>
              )}
            </>
          ),
        };

      case "price_alert":
        return {
          title: `Price alert for ${cardName}`,
          body: (
            <>
              {notification.message
                ? `Price update: ${notification.message
                    .replace(/price /gi, "")
                    .replace(/TCGPlayer/gi, "TCGPlayer")
                    .replace(/CardMarket/gi, "CardMarket")}`
                : "Target price reached"}
            </>
          ),
        };

      default:
        return {
          title: "Notification",
          body: (
            <>
              {notification.message || "New notification"}
              {cardName !== "unknown card" && (
                <>
                  <span> for </span>
                  <span className="font-medium text-foreground">
                    {cardName}
                  </span>
                </>
              )}
            </>
          ),
        };
    }
  };

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-destructive mb-4 text-sm">
          Failed to load notifications. Please try again.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefetch}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mr-3" />
        <span className="text-sm text-muted-foreground">
          Loading notifications...
        </span>
      </div>
    );
  }

  // Handle empty state
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <CheckCircle className="w-8 h-8 text-muted-foreground mb-3" />
        <h3 className="text-title text-foreground mb-2">All caught up!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          No new notifications to review.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefetch}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with bulk actions - Fixed at top */}
      {notifications.length > 1 && (
        <div className="flex items-center justify-end p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="gap-2"
          >
            {markAllAsReadMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Marking all...
              </>
            ) : (
              "Mark all as completed"
            )}
          </Button>
        </div>
      )}

      {/* Scrollable notifications list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-3">
          {notifications.map((notification: EnrichedNotification) => {
            const styling = getNotificationStyling(notification);
            const content = renderNotificationContent(notification);

            return (
              <div
                key={notification.id}
                className={`bg-card rounded-lg border ${styling.borderColor} border-l-4 hover:border-accent transition-colors duration-200 p-4 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 flex-shrink-0">
                        {styling.icon}
                      </span>
                      <div className="space-y-2">
                        {/* Title */}
                        <div className="text-sm font-medium text-foreground">
                          {content.title}
                        </div>

                        {/* Body */}
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          {content.body}
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-muted-foreground">
                          {new Date(
                            notification.created_at ?? new Date(),
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex-shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="gap-2 font-light px-3 py-1.5 hover:bg-accent transition-colors"
                    >
                      {markAsReadMutation.isPending &&
                      markAsReadMutation.variables === notification.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Marking...
                        </>
                      ) : (
                        "Mark as completed"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
