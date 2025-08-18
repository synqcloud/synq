import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Spinner,
} from "@synq/ui/component";

interface RemoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRemoving: boolean;
  removeData: boolean;
  onRemoveDataChange: (removeData: boolean) => void;
  onRemove: () => void;
}

export function RemoveDialog({
  open,
  onOpenChange,
  isRemoving,
  removeData,
  onRemoveDataChange,
  onRemove,
}: RemoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-border bg-card shadow-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light tracking-tight text-foreground">
            Remove Library
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          {isRemoving ? (
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="lg" variant="destructive" className="h-8 w-8" />
              <div className="text-center space-y-2">
                <p className="text-sm font-light text-foreground">
                  Removing...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm text-foreground text-center">
                  What would you like to do with your existing data?
                </p>

                <div className="space-y-3">
                  <Label
                    htmlFor="remove-data-true"
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted"
                  >
                    <Input
                      id="remove-data-true"
                      type="radio"
                      name="removeData"
                      checked={removeData === true}
                      onChange={() => onRemoveDataChange(true)}
                      className="w-4 h-4 text-destructive focus:ring-destructive"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        Remove all data
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Delete all transactions and stock data for this library.
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="remove-data-false"
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted"
                  >
                    <Input
                      id="remove-data-false"
                      type="radio"
                      name="removeData"
                      checked={removeData === false}
                      onChange={() => onRemoveDataChange(false)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        Keep all data
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Preserve your transactions and stock data.
                      </div>
                    </div>
                  </Label>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onRemove}
                  variant="destructive"
                  className="flex-1"
                >
                  Remove Library
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
