// Components
import { DatabaseCard } from "./database-card";

// Services
import { LibraryItemsWithStatus } from "@synq/supabase/services";

interface DatabaseGridProps {
  databases: LibraryItemsWithStatus[];
  onInstall: (databaseId: string) => void;
  onRemove: (databaseId: string) => void;
  isLoading: boolean
}

export function DatabaseGrid({
  databases,
  onInstall,
  onRemove,
  isLoading
}: DatabaseGridProps) {
  return (
    <div className="space-y-12 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databases.map((database) => (
          <DatabaseCard
            key={database.id}
            database={database}
            onInstall={onInstall}
            onRemove={onRemove}
            isLoading= {isLoading}
          />
        ))}
      </div>
    </div>
  );
}
