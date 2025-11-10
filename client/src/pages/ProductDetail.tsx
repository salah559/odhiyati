import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Shield, Award, Percent, ChevronLeft, ChevronRight } from "lucide-react";
import type { Sheep } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    userName: user?.displayName || "",
    userPhone: "",
    shippingAddress: "",
    notes: "",
  });

  const { data: sheep, isLoading } = useQuery<Sheep>({
    queryKey: ["/api/sheep", params?.id],
  });

  const { data: allSheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم التواصل معك قريباً",
      });
      setIsOrderDialogOpen(false);
      setOrderForm({ userName: "", userPhone: "", shippingAddress: "", notes: "" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال الطلب",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !sheep) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  const discountedPrice = sheep.discountPercentage
    ? sheep.price * (1 - sheep.discountPercentage / 100)
    : null;

  const similarSheep = allSheep
    .filter((s) => s.id !== sheep.id && s.category === sheep.category)
    .slice(0, 4);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sheep.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sheep.images.length) % sheep.images.length);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "الرجاء تسجيل الدخول أولاً لإتمام الطلب",
        variant: "destructive",
      });
      return;
    }

    if (!orderForm.userName || !orderForm.userPhone || !orderForm.shippingAddress) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user.uid,
      userEmail: user.email || "",
      userName: orderForm.userName,
      userPhone: orderForm.userPhone,
      shippingAddress: orderForm.shippingAddress,
      notes: orderForm.notes,
      items: [
        {
          sheepId: sheep.id,
          sheepName: sheep.name,
          sheepImage: sheep.images[0],
          price: discountedPrice || sheep.price,
          quantity: 1,
        },
      ],
      totalAmount: discountedPrice || sheep.price,
      status: "pending" as const,
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
              <img
                src={sheep.images[currentImageIndex]}
                alt={`${sheep.name} - صورة ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                data-testid="img-main"
              />
              {sheep.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={prevImage}
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={nextImage}
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {sheep.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {sheep.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/50"
                    }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" data-testid="text-product-name">
                  {sheep.name}
                </h1>
                <Badge data-testid="badge-category">{sheep.category}</Badge>
              </div>
              {sheep.discountPercentage && (
                <Badge variant="destructive" className="gap-1" data-testid="badge-discount">
                  <Percent className="h-3 w-3" />
                  {sheep.discountPercentage}-
                </Badge>
              )}
            </div>

            <div className="mb-6">
              {discountedPrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary" data-testid="text-discounted-price">
                    {discountedPrice.toLocaleString('ar-DZ')} دج
                  </span>
                  <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                    {sheep.price.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-primary" data-testid="text-price">
                  {sheep.price.toLocaleString('ar-DZ')} دج
                </span>
              )}
            </div>

            {/* Specifications */}
            <Card className="p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">المواصفات</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">العمر</dt>
                  <dd className="font-medium" data-testid="text-age">{sheep.age}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">الوزن</dt>
                  <dd className="font-medium" data-testid="text-weight">{sheep.weight}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">السلالة</dt>
                  <dd className="font-medium" data-testid="text-breed">{sheep.breed}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">الحالة الصحية</dt>
                  <dd className="font-medium" data-testid="text-health">{sheep.healthStatus}</dd>
                </div>
              </dl>
            </Card>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">الوصف</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {sheep.description}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: CheckCircle, label: "جودة مضمونة" },
                { icon: Shield, label: "شهادة حلال" },
                { icon: Award, label: "خدمة ممتازة" },
              ].map((item, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-muted">
                  <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Order Button */}
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full" data-testid="button-order">
                  اطلب الآن
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إتمام الطلب</DialogTitle>
                  <DialogDescription>
                    الرجاء ملء البيانات التالية لإتمام طلبك
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">الاسم الكامل *</Label>
                    <Input
                      id="userName"
                      value={orderForm.userName}
                      onChange={(e) => setOrderForm({ ...orderForm, userName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      required
                      data-testid="input-order-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPhone">رقم الهاتف *</Label>
                    <Input
                      id="userPhone"
                      type="tel"
                      value={orderForm.userPhone}
                      onChange={(e) => setOrderForm({ ...orderForm, userPhone: e.target.value })}
                      placeholder="0XXX XXX XXX"
                      required
                      data-testid="input-order-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">عنوان التوصيل *</Label>
                    <Textarea
                      id="shippingAddress"
                      value={orderForm.shippingAddress}
                      onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                      placeholder="أدخل العنوان الكامل"
                      required
                      data-testid="input-order-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                      placeholder="أي ملاحظات أو طلبات خاصة"
                      data-testid="input-order-notes"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createOrderMutation.isPending}
                    data-testid="button-submit-order"
                  >
                    {createOrderMutation.isPending ? "جاري الإرسال..." : "تأكيد الطلب"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Similar Products */}
        {similarSheep.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarSheep.map((sheep) => (
                <ProductCard key={sheep.id} sheep={sheep} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
