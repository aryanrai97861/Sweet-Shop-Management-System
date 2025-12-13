import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface SearchFilterProps {
  onSearch: (params: {
    name?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => void;
  categories: string[];
}

export function SearchFilter({ onSearch, categories }: SearchFilterProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onSearch({
      name: name || undefined,
      category: category && category !== "all" ? category : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  };

  const handleClear = () => {
    setName("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    onSearch({});
  };

  const hasFilters = name || (category && category !== "all") || minPrice || maxPrice;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sweets..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-12"
            data-testid="input-search"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 sm:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          
          <div className={`${isExpanded ? "flex" : "hidden"} sm:flex items-center gap-2 flex-1 sm:flex-none`}>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className={`${isExpanded ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-stretch sm:items-center gap-4`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Price Range:</span>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24 h-12"
            min="0"
            step="0.01"
            data-testid="input-min-price"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 h-12"
            min="0"
            step="0.01"
            data-testid="input-max-price"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={handleClear}
              className="gap-2"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
          <Button onClick={handleSearch} className="gap-2" data-testid="button-apply-filters">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
