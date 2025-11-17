import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadedImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
}

export function ImageUploadExample() {
  const [uploadedImages, setUploadedImages] = useState<number[]>([]);

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImages((prev) => [...prev, image.id]);
    console.log("تم رفع الصورة:", image);
  };

  const handleImageRemoved = (imageId: number) => {
    setUploadedImages((prev) => prev.filter((id) => id !== imageId));
    console.log("تم حذف الصورة:", imageId);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>مثال على رفع الصور</CardTitle>
          <CardDescription>
            استخدام مكون ImageUpload لرفع الصور إلى ImgBB وحفظها في قاعدة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            multiple={true}
            maxImages={5}
          />

          {uploadedImages.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h3 className="font-semibold mb-2">معرفات الصور المرفوعة:</h3>
              <p className="text-sm text-muted-foreground">
                {uploadedImages.join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                يمكنك استخدام هذه المعرفات لحفظها في جدول آخر (مثل جدول الأغنام)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
