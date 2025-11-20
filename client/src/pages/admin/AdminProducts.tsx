import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Sheep } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { SeedDataButton } from "@/components/admin/SeedDataButton";

export default function AdminProducts() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSheep, setEditingSheep] = useState<Sheep | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: sheep = [], isLoading } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/sheep/${id}`, "DELETE");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/sheep"] });
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المنتج",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل حذف المنتج",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sheep: Sheep) => {
    setEditingSheep(sheep);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingSheep(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-products-title">
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف المنتجات</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto" data-testid="button-add-product">
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      <SeedDataButton />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : sheep.length === 0 ? (
        <Card className="p-8 sm:p-16 text-center">
          <p className="text-muted-foreground mb-4">لا توجد منتجات بعد</p>
          <Button onClick={handleAdd} data-testid="button-add-first">
            إضافة أول منتج
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sheep.map((item) => (
            <Card key={item.id} className="overflow-hidden" data-testid={`card-product-${item.id}`}>
              <div className="relative aspect-square">
                <img
                  src={item.images?.[0] || '/placeholder.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.discountPercentage && (
                  <Badge variant="destructive" className="absolute top-2 left-2">
                    {item.discountPercentage}%-
                  </Badge>
                )}
                <Badge variant="secondary" className="absolute bottom-2 right-2">
                  {item.category}
                </Badge>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">{item.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  {item.age} • {item.weight}
                </p>
                <div className="mb-4">
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {item.price.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => handleEdit(item)}
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => setDeleteId(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا المنتج بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        sheep={editingSheep}
      />
    </div>
  );
}
