// Components
import { DatabaseCard } from "./database-card";
// Services
import { LibraryItemsWithStatus } from "@synq/supabase/services";

interface DatabaseGridProps {
  databases: LibraryItemsWithStatus[];
  onInstall: (databaseId: string) => void;
  onRemove: (databaseId: string) => void;
  isLoading: boolean;
}

export function DatabaseGrid({
  databases,
  onInstall,
  onRemove,
  isLoading,
}: DatabaseGridProps) {
  // Sort databases to show active ones first
  const sortedDatabases = databases.sort((a, b) => {
    // Active databases first (status === 'active' comes before 'inactive')
    if (a.status === "active" && b.status === "inactive") return -1;
    if (a.status === "inactive" && b.status === "active") return 1;
    // Keep original order for databases with same status
    return 0;
  });

  return (
    <div className="space-y-12 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDatabases.map((database) => (
          <DatabaseCard
            key={database.id}
            database={database}
            onInstall={onInstall}
            onRemove={onRemove}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
