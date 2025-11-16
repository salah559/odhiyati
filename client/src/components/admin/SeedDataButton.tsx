import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Database, Loader2 } from "lucide-react";
import type { InsertSheep } from "@shared/schema";

const sampleProducts: InsertSheep[] = [
  {
    name: "خروف محلي ممتاز",
    category: "محلي",
    price: 85000,
    discountPercentage: 10,
    images: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1563256905-dc104f8ece9b?w=800&h=800&fit=crop"
    ],
    age: "سنتان",
    weight: "85 كجم",
    breed: "العواسي",
    healthStatus: "ممتاز - تم الفحص البيطري",
    description: "خروف عواسي محلي أصيل، صحة ممتازة، مناسب للأضحية. تم فحصه بيطرياً والتأكد من سلامته.",
    isFeatured: true,
  },
  {
    name: "خروف روماني مميز",
    category: "روماني",
    price: 95000,
    images: [
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1584267761987-f7e5b32fe2cd?w=800&h=800&fit=crop"
    ],
    age: "سنة ونصف",
    weight: "60 كجم",
    breed: "روماني مستورد",
    healthStatus: "جيد جداً",
    description: "خروف روماني مستورد بصحة ممتازة، لحم طري وجودة عالية.",
    isFeatured: true,
  },
  {
    name: "خروف إسباني فاخر",
    category: "إسباني",
    price: 120000,
    discountPercentage: 15,
    images: [
      "https://images.unsplash.com/photo-1569935339919-76d63379f328?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1588595276888-d6ca3e3f94a8?w=800&h=800&fit=crop"
    ],
    age: "3 سنوات",
    weight: "90 كجم",
    breed: "إسباني أصيل",
    healthStatus: "ممتاز - شهادة صحية",
    description: "خروف إسباني أصيل من أفضل السلالات، وزن مثالي وصحة ممتازة مع شهادة صحية معتمدة.",
    isFeatured: true,
  },
  {
    name: "خروف محلي - عرض خاص",
    category: "محلي",
    price: 75000,
    discountPercentage: 20,
    images: [
      "https://images.unsplash.com/photo-1550419541-e0b6d33fc4b5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572788784834-0a6d8f062e9e?w=800&h=800&fit=crop"
    ],
    age: "سنتان",
    weight: "75 كجم",
    breed: "البربري",
    healthStatus: "جيد جداً",
    description: "خروف بربري محلي ممتاز بسعر مخفض! فرصة رائعة للحصول على أضحية عالية الجودة بسعر مناسب.",
    isFeatured: false,
  },
  {
    name: "خروف روماني اقتصادي",
    category: "روماني",
    price: 85000,
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=800&fit=crop"
    ],
    age: "سنة",
    weight: "55 كجم",
    breed: "روماني",
    healthStatus: "جيد",
    description: "خروف روماني مناسب للميزانيات المحدودة، صحة جيدة وجودة مضمونة.",
    isFeatured: false,
  },
  {
    name: "خروف محلي فاخر - اختيار المربين",
    category: "محلي",
    price: 150000,
    images: [
      "https://images.unsplash.com/photo-1567416220050-68a8fdc9e1f4?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1581579438747-27d445775bf0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1543637005-6ee5f9656280?w=800&h=800&fit=crop"
    ],
    age: "3 سنوات",
    weight: "95 كجم",
    breed: "النعيمي",
    healthStatus: "ممتاز - فحص شامل",
    description: "خروف نعيمي محلي فاخر من أجود السلالات، وزن استثنائي وصحة ممتازة. مثالي لمن يبحث عن الأفضل.",
    isFeatured: true,
  },
];

export function SeedDataButton() {
  const { isPrimaryAdmin } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  if (!isPrimaryAdmin) {
    return null;
  }

  const handleSeed = async () => {
    if (isSeeded) {
      toast({
        title: "تم إضافة البيانات مسبقاً",
        description: "البيانات التجريبية موجودة بالفعل",
      });
      return;
    }

    setIsSeeding(true);
    let successCount = 0;

    try {
      for (const product of sampleProducts) {
        await apiRequest("/api/sheep", "POST", product);
        successCount++;
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/sheep"] });
      
      setIsSeeded(true);
      toast({
        title: "نجح! 🎉",
        description: `تمت إضافة ${successCount} منتج تجريبي بنجاح`,
      });

      // Reload the page to show new products
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "خطأ",
        description: `فشلت إضافة البيانات. تم إضافة ${successCount} منتج فقط.`,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="p-4 bg-amber-50 border-amber-200">
      <div className="flex items-start gap-3">
        <Database className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">
            إضافة بيانات تجريبية
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            هذا الزر مخصص للمدير الرئيسي فقط. انقر لإضافة 6 منتجات تجريبية إلى قاعدة البيانات.
          </p>
          <Button
            onClick={handleSeed}
            disabled={isSeeding || isSeeded}
            variant="outline"
            className="gap-2 border-amber-300 hover:bg-amber-100"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : isSeeded ? (
              "تمت الإضافة ✓"
            ) : (
              <>
                <Database className="h-4 w-4" />
                إضافة منتجات تجريبية
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
