import Image from "next/image";
// COMPONENTS
import {
  Card,
  CardContent,
  VStack,
  HStack,
  Button,
  Spinner,
} from "@synq/ui/component";
import { Check, DatabaseIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@synq/ui/utils";
// SERVICES
import { LibraryItemsWithStatus } from "@synq/supabase/services";

interface DatabaseCardProps {
  database: LibraryItemsWithStatus;
  onInstall: (databaseId: string) => void;
  onRemove: (databaseId: string) => void;
  isLoading: boolean;
}

export function DatabaseCard({
  database,
  onInstall,
  onRemove,
  isLoading,
}: DatabaseCardProps) {
  const isDisabled = database.status === "inactive";
  const isInstalled = database.user_library_access?.length > 0;

  const getButtonContent = () => {
    if (isInstalled) {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          Installed
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <Spinner size="sm" className="h-4 w-4 mr-2" />
          Installing...
        </>
      );
    }
    return (
      <>
        <Plus className="w-4 h-4 mr-2" />
        Add to Inventory
      </>
    );
  };

  const cardStyles = cn(
    "border bg-transparent shadow-sm rounded-lg transition-all duration-200",
    isDisabled
      ? "opacity-50 border-border"
      : "border-border shadow-sm hover:shadow-md bg-card",
  );

  const imageStyles = cn("w-8 h-8 object-contain transition-all duration-200", {
    "grayscale opacity-60": isDisabled,
  });

  const titleStyles = cn(
    "text-sm font-light tracking-tight",
    isDisabled ? "text-muted-foreground" : "text-foreground",
  );

  const descriptionStyles = cn(
    "text-xs leading-relaxed",
    isDisabled ? "text-muted-foreground" : "text-foreground",
  );

  return (
    <Card className={cardStyles}>
      <CardContent className="p-4">
        <VStack gap={2} align="center" className="text-center">
          {database.image_url ? (
            <Image
              width={32}
              height={32}
              src={database.image_url}
              alt={database.name}
              className={imageStyles}
            />
          ) : (
            <span className="text-lg">{<DatabaseIcon />}</span>
          )}
          <h4 className={titleStyles}>{database.name}</h4>
          <p className={descriptionStyles}>{database.description}</p>
          {isInstalled ? (
            <HStack className="w-full gap-2">
              <Button variant="outline" size="sm" className="w-full" disabled>
                {getButtonContent()}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(database.id)}
                disabled={isLoading}
                aria-label="Remove database"
              >
                {isLoading ? (
                  <Spinner size="sm" className="h-4 w-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </HStack>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onInstall(database.id)}
              disabled={isDisabled || isLoading}
            >
              {getButtonContent()}
            </Button>
          )}
        </VStack>
      </CardContent>
    </Card>
  );
}
