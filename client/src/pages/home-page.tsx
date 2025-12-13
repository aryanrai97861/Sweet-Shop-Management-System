import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sweet, SearchSweetsParams } from "@shared/schema";
import { Header } from "@/components/header";
import { SweetCard, SweetCardSkeleton } from "@/components/sweet-card";
import { SearchFilter } from "@/components/search-filter";
import { EmptyState } from "@/components/empty-state";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Candy } from "lucide-react";

export default function HomePage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<SearchSweetsParams>({});
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const buildQueryString = (params: SearchSweetsParams) => {
    const query = new URLSearchParams();
    if (params.name) query.set("name", params.name);
    if (params.category) query.set("category", params.category);
    if (params.minPrice) query.set("minPrice", params.minPrice);
    if (params.maxPrice) query.set("maxPrice", params.maxPrice);
    return query.toString();
  };

  const queryString = buildQueryString(searchParams);
  const queryKey = queryString ? `/api/sweets/search?${queryString}` : "/api/sweets";

  const { data: sweets, isLoading } = useQuery<Sweet[]>({
    queryKey: [queryKey],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/sweets/categories"],
  });

  console.log("Categories fetched:", categories);

  const purchaseMutation = useMutation({
    mutationFn: async (sweetId: number) => {
      const res = await apiRequest("POST", `/api/sweets/${sweetId}/purchase`);
      return await res.json();
    },
    onSuccess: () => {
      setPurchaseSuccess(true);
      // Invalidate all sweet queries including search results
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"], refetchType: "all" });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith("/api/sweets") 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
      setPurchaseDialogOpen(false);
    },
  });

  const handleSearch = (params: SearchSweetsParams) => {
    setSearchParams(params);
  };

  const handlePurchaseClick = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setPurchaseSuccess(false);
    setPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (selectedSweet) {
      purchaseMutation.mutate(selectedSweet.id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setPurchaseDialogOpen(open);
    if (!open) {
      setPurchaseSuccess(false);
      setSelectedSweet(null);
    }
  };

  const hasSearchParams = Object.values(searchParams).some((v) => v);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Candy className="w-8 h-8 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Our Sweets</h1>
          </div>
          <p className="text-muted-foreground">
            Browse our delicious collection of handcrafted treats
          </p>
        </div>

        <div className="mb-8">
          <SearchFilter onSearch={handleSearch} categories={categories} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SweetCardSkeleton key={i} />
            ))}
          </div>
        ) : sweets && sweets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onPurchase={handlePurchaseClick}
                isPurchasing={purchaseMutation.isPending && selectedSweet?.id === sweet.id}
              />
            ))}
          </div>
        ) : hasSearchParams ? (
          <EmptyState
            type="no-results"
            onAction={() => setSearchParams({})}
            actionLabel="Clear Filters"
          />
        ) : (
          <EmptyState type="no-sweets" />
        )}
      </main>

      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={handleDialogClose}
        sweet={selectedSweet}
        onConfirm={handleConfirmPurchase}
        isPending={purchaseMutation.isPending}
        success={purchaseSuccess}
      />
    </div>
  );
}
