import { DatabaseCard } from "./database-card";
import { Database } from "../data/synq-databases";

interface DatabaseGridProps {
  databases: Database[];
  onInstall: (databaseName: string) => void;
  onConfigure?: (databaseName: string) => void;
}

export function DatabaseGrid({
  databases,
  onInstall,
  onConfigure,
}: DatabaseGridProps) {
  return (
    <div className="space-y-12 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databases.map((database) => (
          <DatabaseCard
            key={database.id}
            database={database}
            onInstall={onInstall}
            onConfigure={onConfigure}
          />
        ))}
      </div>
    </div>
  );
}
