"use client";

// ICONS
import { User, AlertTriangle, Earth } from "lucide-react";

// UI COMPONENTS
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@synq/ui/component";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@synq/ui/component";
import { motion } from "framer-motion";

// MODULES
import { AccountForm } from "./forms/account-form";

// API
import type { UserSettings } from "@synq/supabase/types";
import { useState } from "react";
import { RegionForm } from "./forms/region-form";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const settingsSections = [
  {
    key: "account",
    title: "Account Settings",
    description: "Update your account information and profile.",
    content: (data: UserSettings) => <AccountForm initialData={data.user} />,
    icon: <User className="w-5 h-5" />,
    color: "blue",
  },
  {
    key: "region",
    title: "Region",
    description: "Select your selling region.",
    content: (data: UserSettings) => <RegionForm />,
    icon: <Earth className="w-5 h-5" />,
    color: "blue",
  },
  {
    key: "danger",
    title: "Danger Zone",
    description: "Irreversible and destructive actions.",
    content: (data: UserSettings) => <DangerZone userId={data.user.id} />,
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "red",
  },
];

interface SettingsContentProps {
  settingsData: UserSettings;
}

export function SettingsContent({ settingsData }: SettingsContentProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <div className="grid gap-6">
        {settingsSections.map((section) => (
          <motion.div key={section.key} variants={fadeInUp}>
            <Card className="relative overflow-hidden border-border bg-card">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-accent/5 to-transparent opacity-30 pointer-events-none" />

              <CardHeader className="relative bg-muted/50 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {section.content(settingsData)}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DangerZone({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account deleted");

      // Redirect to home page after successful deletion
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete your account. Please try again later.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">
            Delete Account
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin mr-2">
                      <div className="h-full w-full rounded-full border-2 border-current border-t-transparent" />
                    </div>
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
