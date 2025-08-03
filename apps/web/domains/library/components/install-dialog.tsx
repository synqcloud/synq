import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@synq/ui/component";
import { CheckCircle } from "lucide-react";

interface InstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isInstalling: boolean;
  databaseName: string | null;
}

export function InstallDialog({
  open,
  onOpenChange,
  isInstalling,
  databaseName,
}: InstallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-gray-200 bg-white shadow-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light tracking-tight text-foreground">
            Installing {databaseName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-6">
          {isInstalling ? (
            <>
              <Spinner size="lg" className="h-8 w-8" />
              <div className="text-center space-y-2">
                <p className="text-sm font-light text-foreground">
                  Setting up your database...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="text-center space-y-2">
                <p className="text-sm font-light text-foreground">
                  Installation Complete!
                </p>
                <p className="text-xs text-muted-foreground">
                  {databaseName} is now ready to use
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
