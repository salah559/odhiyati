import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { insertSheepSchema, type InsertSheep, type Sheep, sheepCategories } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { createSheep, updateSheep } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2 } from "lucide-react";
import { uploadImageToImgBB } from "@/lib/imgbb";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheep: Sheep | null;
}

export function ProductFormDialog({ open, onOpenChange, sheep }: ProductFormDialogProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<InsertSheep>({
    resolver: zodResolver(insertSheepSchema),
    defaultValues: {
      name: "",
      category: "كبش",
      price: 0,
      discountPercentage: 0,
      images: [],
      age: "",
      weight: "",
      breed: "",
      healthStatus: "",
      description: "",
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (sheep) {
      form.reset({
        name: sheep.name,
        category: sheep.category,
        price: sheep.price,
        discountPercentage: sheep.discountPercentage || 0,
        images: sheep.images,
        age: sheep.age,
        weight: sheep.weight,
        breed: sheep.breed,
        healthStatus: sheep.healthStatus,
        description: sheep.description,
        isFeatured: sheep.isFeatured,
      });
      setImageUrls(sheep.images);
    } else {
      form.reset({
        name: "",
        category: "كبش",
        price: 0,
        discountPercentage: 0,
        images: [],
        age: "",
        weight: "",
        breed: "",
        healthStatus: "",
        description: "",
        isFeatured: false,
      });
      setImageUrls([]);
    }
  }, [sheep, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertSheep) => {
      if (sheep) {
        return await updateSheep(sheep.id, data);
      } else {
        return await createSheep(data);
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: ["sheep"] });
      await queryClient.refetchQueries({ queryKey: ["sheep"] });
      
      toast({
        title: sheep ? "تم التحديث بنجاح" : "تم الإضافة بنجاح",
        description: sheep ? "تم تحديث المنتج" : "تم إضافة المنتج",
      });
      onOpenChange(false);
      form.reset();
      setImageUrls([]);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشلت العملية",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      const updated = [...imageUrls, imageUrl];
      setImageUrls(updated);
      form.setValue("images", updated);
      toast({
        title: "نجاح",
        description: "تم رفع الصورة بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const addImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updated = [...imageUrls, newImageUrl];
      setImageUrls(updated);
      form.setValue("images", updated);
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
    form.setValue("images", updated);
  };

  const onSubmit = (data: InsertSheep) => {
    if (imageUrls.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب إضافة صورة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ ...data, images: imageUrls });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sheep ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
          <DialogDescription>
            {sheep ? "قم بتعديل بيانات المنتج" : "قم بإضافة منتج جديد"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنتج *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: خروف نعيمي" {...field} data-testid="input-name" />
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
                  <FormLabel>الفئة *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sheepCategories.map((cat) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (دج) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة التخفيض (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-discount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <FormLabel>الصور *</FormLabel>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                    id="image-upload"
                    data-testid="input-image-file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-2"
                    data-testid="button-upload-image"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        رفع صورة
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="أو أدخل رابط الصورة"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    data-testid="input-image-url"
                  />
                  <Button type="button" onClick={addImageUrl} data-testid="button-add-image">
                    إضافة
                  </Button>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 left-1 h-6 w-6"
                        onClick={() => removeImageUrl(index)}
                        data-testid={`button-remove-image-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العمر *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: سنتان" {...field} data-testid="input-age" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوزن *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 45 كجم" {...field} data-testid="input-weight" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السلالة *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: نعيمي" {...field} data-testid="input-breed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة الصحية *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: ممتازة" {...field} data-testid="input-health" />
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
                  <FormLabel>الوصف *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف تفصيلي للمنتج"
                      className="min-h-24"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-featured"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">منتج مميز</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-submit">
                {mutation.isPending ? "جاري الحفظ..." : sheep ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
