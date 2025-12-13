import { Candy, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no-sweets" | "no-results" | "no-stock";
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const config = {
    "no-sweets": {
      icon: Candy,
      title: "No sweets available",
      description: "Check back later for delicious treats!",
    },
    "no-results": {
      icon: Search,
      title: "No sweets found",
      description: "Try adjusting your search or filters to find what you're looking for.",
    },
    "no-stock": {
      icon: Package,
      title: "Everything is sold out!",
      description: "We're restocking our shelves. Check back soon!",
    },
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif font-semibold text-xl mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction} className="mt-6" data-testid="button-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
