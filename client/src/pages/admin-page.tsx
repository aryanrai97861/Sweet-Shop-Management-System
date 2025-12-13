import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sweet, InsertSweet, UpdateSweet } from "@shared/schema";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  PackagePlus,
  Loader2,
  Candy,
  AlertTriangle,
  DollarSign,
  TrendingDown,
} from "lucide-react";

const sweetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type SweetFormValues = z.infer<typeof sweetFormSchema>;

const categories = ["Chocolate", "Candy", "Gummies", "Cookies", "Cake", "Pastry"];

export default function AdminPage() {
  const { toast } = useToast();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<SweetFormValues>({
    resolver: zodResolver(sweetFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      quantity: 0,
      description: "",
      imageUrl: "",
    },
  });

  const { data: sweets, isLoading } = useQuery<Sweet[]>({
    queryKey: ["/api/sweets"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSweet) => {
      const res = await apiRequest("POST", "/api/sweets", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Sweet added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets/categories"] });
      setFormDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add sweet", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSweet }) => {
      const res = await apiRequest("PUT", `/api/sweets/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Sweet updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets/categories"] });
      setFormDialogOpen(false);
      setSelectedSweet(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update sweet", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sweets/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Sweet deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets/categories"] });
      setDeleteDialogOpen(false);
      setSelectedSweet(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete sweet", description: error.message, variant: "destructive" });
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("POST", `/api/sweets/${id}/restock`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Sweet restocked successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      setRestockDialogOpen(false);
      setSelectedSweet(null);
      setRestockAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to restock sweet", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = () => {
    setIsEditing(false);
    setSelectedSweet(null);
    form.reset({
      name: "",
      category: "",
      price: "",
      quantity: 0,
      description: "",
      imageUrl: "",
    });
    setFormDialogOpen(true);
  };

  const handleEdit = (sweet: Sweet) => {
    setIsEditing(true);
    setSelectedSweet(sweet);
    form.reset({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      description: sweet.description || "",
      imageUrl: sweet.imageUrl || "",
    });
    setFormDialogOpen(true);
  };

  const handleDelete = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setDeleteDialogOpen(true);
  };

  const handleRestock = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setRestockAmount("");
    setRestockDialogOpen(true);
  };

  const onSubmit = (data: SweetFormValues) => {
    const sweetData: InsertSweet = {
      name: data.name,
      category: data.category,
      price: data.price,
      quantity: data.quantity,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    };

    if (isEditing && selectedSweet) {
      updateMutation.mutate({ id: selectedSweet.id, data: sweetData });
    } else {
      createMutation.mutate(sweetData);
    }
  };

  const confirmDelete = () => {
    if (selectedSweet) {
      deleteMutation.mutate(selectedSweet.id);
    }
  };

  const confirmRestock = () => {
    if (selectedSweet && restockAmount) {
      restockMutation.mutate({ id: selectedSweet.id, quantity: parseInt(restockAmount) });
    }
  };

  const totalSweets = sweets?.length || 0;
  const lowStockCount = sweets?.filter((s) => s.quantity <= 5 && s.quantity > 0).length || 0;
  const outOfStockCount = sweets?.filter((s) => s.quantity === 0).length || 0;
  const totalValue =
    sweets?.reduce((sum, s) => sum + parseFloat(s.price) * s.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your sweet shop inventory</p>
          </div>
          <Button onClick={handleAdd} className="gap-2" data-testid="button-add-sweet">
            <Plus className="w-4 h-4" />
            Add Sweet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sweets</CardTitle>
              <Candy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-sweets">{totalSweets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600" data-testid="stat-low-stock">
                {lowStockCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive" data-testid="stat-out-of-stock">
                {outOfStockCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-inventory-value">
                ${totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sweets && sweets.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sweets.map((sweet) => (
                      <TableRow key={sweet.id} data-testid={`row-sweet-${sweet.id}`}>
                        <TableCell className="font-mono text-sm">{sweet.id}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {sweet.imageUrl ? (
                              <img
                                src={sweet.imageUrl}
                                alt={sweet.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{sweet.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sweet.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${parseFloat(sweet.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              sweet.quantity === 0
                                ? "destructive"
                                : sweet.quantity <= 5
                                ? "secondary"
                                : "default"
                            }
                          >
                            {sweet.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestock(sweet)}
                              data-testid={`button-restock-${sweet.id}`}
                            >
                              <PackagePlus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(sweet)}
                              data-testid={`button-edit-${sweet.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(sweet)}
                              data-testid={`button-delete-${sweet.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No sweets in inventory</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by adding your first sweet
                </p>
                <Button onClick={handleAdd} data-testid="button-add-first-sweet">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sweet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Sweet" : "Add New Sweet"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of this sweet"
                : "Fill in the details to add a new sweet to your inventory"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Sweet name" data-testid="input-sweet-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sweet-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          data-testid="input-sweet-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="0"
                          data-testid="input-sweet-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="A delicious treat..."
                        className="h-20"
                        data-testid="textarea-sweet-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-sweet-image-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormDialogOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-sweet"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : isEditing ? (
                    "Update Sweet"
                  ) : (
                    "Add Sweet"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Sweet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedSweet?.name}</span>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Sweet</DialogTitle>
            <DialogDescription>
              Enter the quantity to add to <span className="font-medium">{selectedSweet?.name}</span>.
              Current stock: {selectedSweet?.quantity}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              placeholder="Enter quantity to add"
              data-testid="input-restock-amount"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRestockDialogOpen(false)}
              disabled={restockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRestock}
              disabled={restockMutation.isPending || !restockAmount}
              data-testid="button-confirm-restock"
            >
              {restockMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restocking...
                </>
              ) : (
                "Restock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
