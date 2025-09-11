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
      // Optimistically update the cache
      safeUpdateCache(() => {
        queryClient.setQueryData(
          ["notifications"],
          (old: EnrichedNotification[] = []) =>
            old.filter((n) => n.id !== notificationId),
        );
      });
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
      // Clear all notifications from cache
      safeUpdateCache(() => {
        queryClient.setQueryData(["notifications"], []);
        // Invalidate notification count query to update header badge
        queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      });
    },
    onError: (error) => {
      console.error(error);
      safeToast("error", "Failed to mark all notifications as completed.");
    },
  });

  const openAudit = useCallback((auditId: string) => {
    if (isMountedRef.current) {
      window.open(`/stock-audit/${auditId}`, "_blank");
    }
  }, []);

  const handleRefetch = useCallback(() => {
    if (isMountedRef.current) {
      refetch();
    }
  }, [refetch]);

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
          {notifications.map((notification: EnrichedNotification) => (
            <div
              key={notification.id}
              className="bg-card rounded-lg border hover:border-accent transition-colors duration-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Notification content */}
                  <div className="text-sm text-card-foreground leading-relaxed">
                    <span>There is a possible discrepancy on </span>
                    <span className="font-medium text-foreground">
                      {notification.stock?.core_card?.name || "unknown stock"}
                    </span>
                    <span> after this change </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="inline-flex items-center gap-1 h-auto p-0 text-primary hover:text-primary/80 font-medium"
                      onClick={() => openAudit(notification.audit.id)}
                    >
                      view audit
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    {notification.marketplace && (
                      <>
                        <span> - Please update the stock in </span>
                        <MarketplaceIcon
                          marketplace={notification.marketplace.name}
                          showLabel
                          isIntegration={false}
                          className="inline-flex items-center align-middle"
                        />
                      </>
                    )}
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

                {/* Action button */}
                <div className="flex-shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    disabled={markAsReadMutation.isPending}
                    className="gap-2"
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
          ))}
        </div>
      </div>
    </div>
  );
}
