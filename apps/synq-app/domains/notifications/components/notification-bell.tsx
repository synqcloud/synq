"use client";
import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@synq/ui/component";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NotificationsService } from "@synq/supabase/services";

const NotificationBell: React.FC = () => {
  const router = useRouter();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Query to get unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notification-count"],
    queryFn: async () => {
      const notifications =
        await NotificationsService.getUserNotifications("client");
      return notifications.length; // Since we only fetch unread notifications
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute to stay updated
    enabled: isMountedRef.current, // Only run query when component is mounted
  });

  const handleClick = () => {
    if (isMountedRef.current) {
      router.push("/notifications");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="relative p-2 h-9 w-9"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <>
          {/* Amber dot indicator - positioned relative to the button, not the icon */}
          <div className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-background" />
          {/* Screen reader text */}
          <span className="sr-only">{unreadCount} unread notifications</span>
        </>
      )}
    </Button>
  );
};

export default NotificationBell;
