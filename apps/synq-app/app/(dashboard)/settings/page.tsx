"use client";

// API
import { UserService } from "@synq/supabase/services";

// CLIENT COMPONENTS
import { SettingsContent } from "@/domains/settings/components";
import { motion, HTMLMotionProps, MotionProps } from "framer-motion";
import { useEffect, useState } from "react";

// Make a custom type that correctly extends HTMLMotionProps
type MotionDivProps = HTMLMotionProps<"div"> &
  MotionProps & {
    className?: string;
  };

// Create a typed motion.div component
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use the new UserService to get current user
        const user = await UserService.getCurrentUser("client");

        // Transform to the expected format for SettingsContent
        const data = {
          user: {
            id: user.id,
            name: user.user_metadata?.full_name || user.email || "",
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url || "",
          },
        };

        setSettingsData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settingsData) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Failed to load settings
          </h2>
          <p className="text-muted-foreground">
            Please refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6 p-6 max-w-7xl mx-auto"
        >
          <SettingsContent settingsData={settingsData} />
        </MotionDiv>
      </div>
    </div>
  );
}
