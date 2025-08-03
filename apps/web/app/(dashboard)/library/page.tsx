"use client";
// CORE
import { useState, useEffect } from "react";
// COMPONENTS
import {
  DatabaseGrid,
  InstallDialog,
  RemoveDialog,
  ImportableGroupsDialog,
} from "@/domains/library/components";

// DATA
import { mockData } from "@/domains/library/data/synq-databases";
import { getImportableGroups } from "@/domains/library/data/importable-groups";
import { toast } from "sonner";

export default function LibraryPage() {
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [installingDatabase, setInstallingDatabase] = useState<string | null>(
    null,
  );
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removingDatabase, setRemovingDatabase] = useState<string | null>(null);
  const [removeData, setRemoveData] = useState(false);
  const [showImportableGroupsDialog, setShowImportableGroupsDialog] =
    useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Library";
  }, []);

  const handleInstall = async (databaseName: string) => {
    const database = mockData.find((db) => db.name === databaseName);

    if (database?.status === "active") {
      // Show remove confirmation dialog
      setRemovingDatabase(databaseName);
      setShowRemoveDialog(true);
      return;
    }

    // Check if this database has importable groups
    const importableGroups = getImportableGroups(databaseName);
    const hasImportableGroups = importableGroups.length > 0;

    if (hasImportableGroups) {
      // Show importable groups dialog
      setSelectedDatabase(databaseName);
      setShowImportableGroupsDialog(true);
      return;
    }

    // Fall back to direct installation
    setInstallingDatabase(databaseName);
    setShowInstallDialog(true);
    setIsInstalling(true);

    // Simulate installation process
    setTimeout(() => {
      setIsInstalling(false);
      setShowInstallDialog(false);
      setInstallingDatabase(null);
      // Here you would typically update the database status
    }, 3000);
  };

  const handleConfigure = async (databaseName: string) => {
    // Check if this database has importable groups
    const importableGroups = getImportableGroups(databaseName);
    const hasImportableGroups = importableGroups.length > 0;

    if (hasImportableGroups) {
      // Show importable groups dialog for configuration
      setSelectedDatabase(databaseName);
      setShowImportableGroupsDialog(true);
      return;
    }

    // For databases without importable groups, show a simple configuration dialog
    toast.info("Configuration", {
      description: `Configure ${databaseName} settings`,
      duration: 3000,
    });
  };

  const handleImportableGroupsInstall = async (
    databaseName: string,
    groupId?: string,
  ) => {
    setShowImportableGroupsDialog(false);
    setSelectedDatabase(null);

    setInstallingDatabase(databaseName);
    setShowInstallDialog(true);
    setIsInstalling(true);

    // Simulate installation process
    setTimeout(() => {
      setIsInstalling(false);
      setShowInstallDialog(false);
      setInstallingDatabase(null);
      // Here you would typically update the database status and handle group-specific installation
    }, 3000);
  };

  const handleRemove = async () => {
    setIsInstalling(true);

    // Simulate removal process
    setTimeout(() => {
      setIsInstalling(false);
      setShowRemoveDialog(false);
      setRemovingDatabase(null);
      setRemoveData(false);
      // Here you would typically update the database status and handle data removal
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <DatabaseGrid
            databases={mockData}
            onInstall={handleInstall}
            onConfigure={handleConfigure}
          />
        </div>
      </div>

      {/* Dialogs */}
      <InstallDialog
        open={showInstallDialog}
        onOpenChange={setShowInstallDialog}
        databaseName={installingDatabase}
        isInstalling={isInstalling}
      />

      <RemoveDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        databaseName={removingDatabase}
        isRemoving={isInstalling}
        removeData={removeData}
        onRemoveDataChange={setRemoveData}
        onRemove={handleRemove}
      />

      <ImportableGroupsDialog
        open={showImportableGroupsDialog}
        onOpenChange={setShowImportableGroupsDialog}
        databaseName={selectedDatabase || ""}
        onInstall={handleImportableGroupsInstall}
        installedGroups={
          mockData.find((db) => db.name === selectedDatabase)
            ?.installedGroups || []
        }
        isConfigureMode={
          mockData.find((db) => db.name === selectedDatabase)?.status ===
          "active"
        }
      />
    </div>
  );
}
