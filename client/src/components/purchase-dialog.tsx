import { Sweet } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sweet: Sweet | null;
  onConfirm: () => void;
  isPending: boolean;
  success: boolean;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  sweet,
  onConfirm,
  isPending,
  success,
}: PurchaseDialogProps) {
  if (!sweet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-center">Purchase Successful!</DialogTitle>
              <DialogDescription className="text-center">
                You've purchased <span className="font-medium">{sweet.name}</span> for{" "}
                <span className="font-medium">${parseFloat(sweet.price).toFixed(2)}</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => onOpenChange(false)} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Are you sure you want to purchase this sweet?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {sweet.imageUrl ? (
                  <img
                    src={sweet.imageUrl}
                    alt={sweet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" data-testid="text-dialog-sweet-name">
                  {sweet.name}
                </h4>
                <p className="text-sm text-muted-foreground">{sweet.category}</p>
                <p className="text-lg font-semibold mt-1" data-testid="text-dialog-price">
                  ${parseFloat(sweet.price).toFixed(2)}
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel-purchase"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isPending}
                data-testid="button-confirm-purchase"
              >
                {isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
