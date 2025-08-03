import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Card,
  CardContent,
  VStack,
  HStack,
  Badge,
  ScrollArea,
} from "@synq/ui/component";
import { CheckCircle, Calendar, Hash } from "lucide-react";
import { cn } from "@synq/ui/utils";
import { toast } from "sonner";
import {
  ImportableGroup,
  getImportableGroups,
} from "../data/importable-groups";

interface ImportableGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  databaseName: string;
  onInstall: (databaseName: string, groupId?: string) => void;
  installedGroups?: string[];
  isConfigureMode?: boolean;
}

interface ImportableGroupCardProps {
  group: ImportableGroup;
  databaseName: string;
  onSelect: (groupId: string, isSelected: boolean) => void;
  onRemove?: (groupId: string) => void;
  isSelected: boolean;
  isInstalled: boolean;
  isConfigureMode: boolean;
}

function ImportableGroupCard({
  group,
  databaseName,
  onSelect,
  onRemove,
  isSelected,
  isInstalled,
  isConfigureMode,
}: ImportableGroupCardProps) {
  const cardStyles = cn(
    "border bg-transparent shadow-sm rounded-lg transition-all duration-200",
    isInstalled && isConfigureMode
      ? "border-muted bg-muted/20 cursor-not-allowed"
      : isSelected
        ? "border-primary bg-primary/5 shadow-md cursor-pointer"
        : "border-border shadow-sm hover:shadow-md bg-card hover:bg-card/80 cursor-pointer",
  );

  const titleStyles = cn(
    "text-lg font-light tracking-tight",
    isInstalled && isConfigureMode
      ? "text-muted-foreground"
      : isSelected
        ? "text-primary"
        : "text-foreground",
  );

  const descriptionStyles = cn(
    "text-sm leading-relaxed",
    isInstalled && isConfigureMode
      ? "text-muted-foreground"
      : isSelected
        ? "text-primary/80"
        : "text-muted-foreground",
  );

  return (
    <Card
      className={cardStyles}
      onClick={() => !isInstalled && onSelect(group.id, !isSelected)}
    >
      <CardContent className="p-4">
        <VStack gap={3} align="start">
          <HStack gap={3} align="center" className="w-full">
            <div className="flex-1 min-w-0">
              <h4 className={titleStyles}>{group.name}</h4>
              <p className={descriptionStyles}>{group.description}</p>
            </div>

            {isInstalled && isConfigureMode && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(group.id);
                }}
                className="text-xs"
              >
                Remove
              </Button>
            )}

            {isSelected && !isInstalled && (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}

            {isInstalled && isConfigureMode && (
              <div className="text-xs text-muted-foreground">Installed</div>
            )}
          </HStack>

          <HStack gap={2} className="flex-wrap">
            <Badge variant="secondary" className="text-xs">
              <Hash className="w-3 h-3 mr-1" />
              {group.cardCount} cards
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(group.releaseDate).toLocaleDateString()}
            </Badge>
            {!group.isAvailable && (
              <Badge variant="destructive" className="text-xs">
                Coming Soon
              </Badge>
            )}
          </HStack>
        </VStack>
      </CardContent>
    </Card>
  );
}

export function ImportableGroupsDialog({
  open,
  onOpenChange,
  databaseName,
  onInstall,
  installedGroups = [],
  isConfigureMode = false,
}: ImportableGroupsDialogProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const groups = getImportableGroups(databaseName);

  const handleInstall = () => {
    if (selectedGroupIds.length > 0) {
      // Get the selected groups details
      const selectedGroups = groups.filter((group) =>
        selectedGroupIds.includes(group.id),
      );

      // Show the request being sent to backend
      toast.success("Import Request Sent", {
        description: (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{databaseName}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {selectedGroups.length} set
                {selectedGroups.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedGroups.reduce((sum, group) => sum + group.cardCount, 0)}{" "}
              total cards
            </div>
          </div>
        ),
        duration: 3000,
      });

      // For now, we'll pass the first selected group as the primary one
      // In the future, you might want to modify the onInstall callback to handle multiple groups
      onInstall(databaseName, selectedGroupIds[0]);
    } else {
      // Show request for importing all sets
      toast.success("Import Request Sent", {
        description: (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{databaseName}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">All sets</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {groups.reduce((sum, group) => sum + group.cardCount, 0)} total
              cards
            </div>
          </div>
        ),
        duration: 3000,
      });

      onInstall(databaseName);
    }
    onOpenChange(false);
    setSelectedGroupIds([]);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedGroupIds([]);
  };

  const availableGroups = groups.filter((group) => group.isAvailable);
  const hasAvailableGroups = availableGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] border border-border bg-card shadow-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light tracking-tight text-foreground">
            {databaseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasAvailableGroups ? (
            <>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-light text-foreground">
                    Select sets
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose specific sets or import all
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGroupIds([])}
                    className="text-xs h-7 px-2"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedGroupIds(availableGroups.map((g) => g.id))
                    }
                    className="text-xs h-7 px-3"
                  >
                    Select All
                  </Button>
                </div>
              </div>

              <div className="h-80 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-3 p-1">
                    {availableGroups.map((group) => (
                      <ImportableGroupCard
                        key={group.id}
                        group={group}
                        databaseName={databaseName}
                        onSelect={(groupId, isSelected) => {
                          if (isSelected) {
                            setSelectedGroupIds((prev) => [...prev, groupId]);
                          } else {
                            setSelectedGroupIds((prev) =>
                              prev.filter((id) => id !== groupId),
                            );
                          }
                        }}
                        onRemove={(groupId) => {
                          // Handle remove logic
                          toast.info("Remove Request", {
                            description: `Removing ${group.name} from ${databaseName}`,
                            duration: 3000,
                          });
                        }}
                        isSelected={selectedGroupIds.includes(group.id)}
                        isInstalled={installedGroups.includes(group.id)}
                        isConfigureMode={isConfigureMode}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-sm"
                >
                  Cancel
                </Button>

                <HStack gap={2}>
                  <Button
                    onClick={handleInstall}
                    disabled={selectedGroupIds.length === 0}
                    className="text-sm"
                  >
                    {selectedGroupIds.length > 0
                      ? `Import ${selectedGroupIds.length} Selected Set${selectedGroupIds.length > 1 ? "s" : ""}`
                      : "Select Sets"}
                  </Button>
                </HStack>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="space-y-2">
                <p className="text-sm font-light text-foreground">
                  No importable sets available
                </p>
                <p className="text-xs text-muted-foreground">
                  {databaseName} sets are not yet available for import
                </p>
              </div>
              <Button variant="outline" onClick={handleCancel}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
