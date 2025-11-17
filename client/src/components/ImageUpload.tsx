import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
}

interface ImageUploadProps {
  onImageUploaded?: (image: UploadedImage) => void;
  onImageRemoved?: (imageId: number) => void;
  multiple?: boolean;
  maxImages?: number;
  existingImages?: UploadedImage[];
  className?: string;
}

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  multiple = false,
  maxImages = 5,
  existingImages = [],
  className = "",
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setImages(existingImages);
  }, [JSON.stringify(existingImages)]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return new Promise<UploadedImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const response = await apiRequest("/api/images", "POST", {
              imageData: base64,
              mimeType: file.type,
              originalFileName: file.name,
            });
            const data = await response.json();
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("فشل في قراءة الملف"));
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (data) => {
      setImages((prev) => [...prev, data]);
      onImageUploaded?.(data);
      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم حفظ الصورة في النظام",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في رفع الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast({
        title: "عدد الصور كبير",
        description: `يمكنك رفع ${remainingSlots} صورة فقط`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: `${file.name} ليس صورة صالحة`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: `${file.name} يجب أن يكون أقل من 10 ميجابايت`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviews: string[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    for (const file of validFiles) {
      await uploadMutation.mutateAsync(file);
    }

    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    onImageRemoved?.(imageToRemove.id);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group aspect-square rounded-md border overflow-hidden"
            data-testid={`image-preview-${index}`}
          >
            <img
              src={image.thumbnailUrl}
              alt={`صورة ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
              data-testid={`button-remove-image-${index}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {previews.map((preview, index) => (
          <div
            key={`preview-${index}`}
            className="relative aspect-square rounded-md border overflow-hidden bg-muted"
          >
            <img
              src={preview}
              alt={`معاينة ${index + 1}`}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        ))}

        {canAddMore && (
          <div
            className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover-elevate transition-all"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-upload-image"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center px-2">
                  {images.length === 0 ? "رفع صورة" : "إضافة صورة"}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file"
      />

      <p className="text-sm text-muted-foreground">
        {images.length} / {maxImages} صورة
        {images.length < maxImages && (
          <span className="mr-2">• الحد الأقصى للحجم: 10 ميجابايت</span>
        )}
      </p>
    </div>
  );
}
