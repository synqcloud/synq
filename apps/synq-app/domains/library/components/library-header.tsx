export function LibraryHeader() {
  return (
    <div className="flex-shrink-0 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Library
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            Manage your card collections and inventory databases
          </p>
        </div>
      </div>
    </div>
  );
}
