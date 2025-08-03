import Image from "next/image";
import { Card, CardContent, VStack, Button, HStack } from "@synq/ui/component";
import { DatabaseIcon, Plus, Trash2, Settings } from "lucide-react";
import { cn } from "@synq/ui/utils";
import { Database } from "../data/synq-databases";

interface DatabaseCardProps {
  database: Database;
  onInstall: (databaseName: string) => void;
  onConfigure?: (databaseName: string) => void;
}

const ENABLED_INACTIVE_DATABASES = ["Disney Lorcana", "Pokémon"] as const;

export function DatabaseCard({
  database,
  onInstall,
  onConfigure,
}: DatabaseCardProps) {
  const isDisabled =
    database.status === "inactive" &&
    !ENABLED_INACTIVE_DATABASES.includes(
      database.name as (typeof ENABLED_INACTIVE_DATABASES)[number],
    );
  // TODO: Implement backend
  const getButtonContent = () => {
    return (
      <>
        <Plus className="w-3 h-3 mr-1" />
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
          {database.imageUrl ? (
            <Image
              width={32}
              height={32}
              src={database.imageUrl}
              alt={database.name}
              className={imageStyles}
            />
          ) : (
            <span className="text-lg">{<DatabaseIcon />}</span>
          )}

          <h4 className={titleStyles}>{database.name}</h4>

          <p className={descriptionStyles}>{database.description}</p>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onInstall(database.name)}
            disabled={isDisabled}
          >
            {getButtonContent()}
          </Button>
        </VStack>
      </CardContent>
    </Card>
  );
}
