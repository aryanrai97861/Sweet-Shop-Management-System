import { Sweet } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (sweet: Sweet) => void;
  isPurchasing?: boolean;
}

export function SweetCard({ sweet, onPurchase, isPurchasing }: SweetCardProps) {
  const isOutOfStock = sweet.quantity <= 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity <= 5;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      chocolate: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      candy: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      gummies: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cookies: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      cake: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      pastry: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colors[category.toLowerCase()] || "bg-secondary text-secondary-foreground";
  };

  return (
    <Card className="group overflow-visible flex flex-col hover-elevate" data-testid={`card-sweet-${sweet.id}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-muted">
        {sweet.imageUrl ? (
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif font-semibold text-lg leading-tight" data-testid={`text-sweet-name-${sweet.id}`}>
            {sweet.name}
          </h3>
          <Badge 
            variant="secondary" 
            className={`shrink-0 text-xs ${getCategoryColor(sweet.category)}`}
            data-testid={`badge-category-${sweet.id}`}
          >
            {sweet.category}
          </Badge>
        </div>
        
        {sweet.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {sweet.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-semibold" data-testid={`text-price-${sweet.id}`}>
            ${parseFloat(sweet.price).toFixed(2)}
          </span>
          <span
            className={`text-sm ${isLowStock ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}
            data-testid={`text-stock-${sweet.id}`}
          >
            {isOutOfStock ? "No stock" : isLowStock ? `Only ${sweet.quantity} left!` : `${sweet.quantity} in stock`}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => onPurchase(sweet)}
          disabled={isOutOfStock || isPurchasing}
          data-testid={`button-purchase-${sweet.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isPurchasing ? "Purchasing..." : isOutOfStock ? "Out of Stock" : "Purchase"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SweetCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <CardContent className="flex-1 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
          <div className="h-5 bg-muted rounded w-16 animate-pulse" />
        </div>
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-7 bg-muted rounded w-16 animate-pulse" />
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 bg-muted rounded w-full animate-pulse" />
      </CardFooter>
    </Card>
  );
}
