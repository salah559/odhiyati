import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import type { Sheep, SheepCategory } from "@shared/schema";
import { getAllSheep } from "@/lib/firestore";
import { useLocation } from "wouter";

export default function Products() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category") as SheepCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<SheepCategory | "all" | "أجنبي">(categoryParam || "all");
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(150);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const { data: sheep = [], isLoading } = useQuery<Sheep[]>({
    queryKey: ["sheep"],
    queryFn: getAllSheep,
  });

  // Extract weight number from string (e.g., "45 كجم" -> 45)
  const extractWeight = (weightStr: string): number => {
    const match = weightStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Filter and sort sheep
  const filteredSheep = sheep
    .filter((s) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "أجنبي") return s.category === "روماني" || s.category === "إسباني";
      return s.category === selectedCategory;
    })
    .filter((s) => {
      const weight = extractWeight(s.weight);
      return weight >= minWeight && weight <= maxWeight;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const aPrice = a.discountPercentage ? a.price * (1 - a.discountPercentage / 100) : a.price;
      const bPrice = b.discountPercentage ? b.price * (1 - b.discountPercentage / 100) : b.price;
      return sortBy === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-4">الفئة</h3>
        <RadioGroup value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="all" id="all" data-testid="radio-category-all" />
            <Label htmlFor="all" className="cursor-pointer">الكل</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="محلي" id="local" data-testid="radio-category-local" />
            <Label htmlFor="local" className="cursor-pointer">محلي</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="أجنبي" id="foreign" data-testid="radio-category-foreign" />
            <Label htmlFor="foreign" className="cursor-pointer">أجنبي</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse mr-6">
            <RadioGroupItem value="روماني" id="romanian" data-testid="radio-category-romanian" />
            <Label htmlFor="romanian" className="cursor-pointer">روماني</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse mr-6">
            <RadioGroupItem value="إسباني" id="spanish" data-testid="radio-category-spanish" />
            <Label htmlFor="spanish" className="cursor-pointer">إسباني</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Weight Range */}
      <div>
        <h3 className="font-semibold mb-4">نطاق الوزن (كجم)</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-weight" className="text-sm">الحد الأدنى: {minWeight} كجم</Label>
            <Slider
              id="min-weight"
              min={0}
              max={150}
              step={1}
              value={[minWeight]}
              onValueChange={(v) => setMinWeight(v[0])}
              className="mb-2"
              data-testid="slider-min-weight"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-weight" className="text-sm">الحد الأقصى: {maxWeight} كجم</Label>
            <Slider
              id="max-weight"
              min={0}
              max={150}
              step={1}
              value={[maxWeight]}
              onValueChange={(v) => setMaxWeight(v[0])}
              className="mb-2"
              data-testid="slider-max-weight"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinWeight(0);
              setMaxWeight(150);
            }}
            className="w-full text-xs"
          >
            إعادة تعيين الوزن
          </Button>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-4">الترتيب</h3>
        <RadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="newest" id="newest" data-testid="radio-sort-newest" />
            <Label htmlFor="newest" className="cursor-pointer">الأحدث</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="price-asc" id="price-asc" data-testid="radio-sort-asc" />
            <Label htmlFor="price-asc" className="cursor-pointer">السعر: من الأقل للأعلى</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="price-desc" id="price-desc" data-testid="radio-sort-desc" />
            <Label htmlFor="price-desc" className="cursor-pointer">السعر: من الأعلى للأقل</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-products-title">المنتجات</h1>
          
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2" data-testid="button-mobile-filter">
                <Filter className="h-4 w-4" />
                فلترة
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
            <div className="sticky top-20 md:top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredSheep.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground" data-testid="text-no-products">
                  لا توجد منتجات تطابق معايير البحث
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  عرض {filteredSheep.length} من {sheep.length} منتج
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSheep.map((sheep) => (
                    <ProductCard key={sheep.id} sheep={sheep} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
