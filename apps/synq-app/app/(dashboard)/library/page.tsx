"use client";

// COMPONENTS
import { toast } from "sonner";
import { DatabaseGrid } from "@/domains/library/components";

// DATA
import { LibraryItemsWithStatus, LibraryService } from "@synq/supabase/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function LibraryPage() {
  const queryClient = useQueryClient();

  // Fetch library items
  const { data: libraryItems = [], isLoading } = useQuery({
    queryKey: ["libraryItems"],
    queryFn: async () => LibraryService.getLibraryItems("client"),
  });

  // Install mutation
  const installMutation = useMutation({
    mutationFn: (databaseId: string) => LibraryService.installLibraryToUser("client", databaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryItems"] });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (databaseId: string) => LibraryService.removeLibraryToUser("client", databaseId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryItems"] });
    },
  });

  // Handlers
  const handleInstall = async (databaseId: string) => {

    try {
      await installMutation.mutateAsync(databaseId);
      toast.success("Installed successfully!", {
        description: "The Library is now available on your inventory.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Installation failed", {
        description: String(error),
        duration: 3000,
      });
    }
  };

  const handleRemove = async (databaseId: string) => {

    try {
      await removeMutation.mutateAsync(databaseId);
      toast.success("Successfully Removed!", {
        description: "The Library is not anymore on your inventory.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Something went wrong :/", {
        description: String(error),
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <DatabaseGrid
          databases={libraryItems as LibraryItemsWithStatus[]}
          onInstall={handleInstall}
          onRemove={handleRemove}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
