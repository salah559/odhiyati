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
import { queryClient } from "@/lib/queryClient";
import { getAllSheep, getSheep, createOrder } from "@/lib/firestore";

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

  const { data: sheep, isLoading } = useQuery<Sheep | null>({
    queryKey: ["sheep", params?.id],
    queryFn: () => params?.id ? getSheep(params.id) : Promise.resolve(null),
  });

  const { data: allSheep = [] } = useQuery<Sheep[]>({
    queryKey: ["sheep"],
    queryFn: getAllSheep,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await createOrder(orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
    <div className="min-h-screen py-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <Card className="overflow-hidden border-2 shadow-lg">
              <div className="relative aspect-square bg-muted">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg backdrop-blur-sm bg-background/80"
                      onClick={prevImage}
                      data-testid="button-prev-image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg backdrop-blur-sm bg-background/80"
                      onClick={nextImage}
                      data-testid="button-next-image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                {/* Image Counter */}
                {sheep.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {sheep.images.length}
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {sheep.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {sheep.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover-elevate ${
                      index === currentImageIndex
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
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
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-3 leading-tight" data-testid="text-product-name">
                  {sheep.name}
                </h1>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1" data-testid="badge-category">
                    {sheep.category}
                  </Badge>
                  {sheep.isFeatured && (
                    <Badge className="text-base px-3 py-1 bg-accent text-accent-foreground">
                      ⭐ مميز
                    </Badge>
                  )}
                </div>
              </div>
              {sheep.discountPercentage && (
                <Badge variant="destructive" className="gap-1 text-lg px-4 py-2" data-testid="badge-discount">
                  <Percent className="h-4 w-4" />
                  خصم {sheep.discountPercentage}%
                </Badge>
              )}
            </div>

            <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              {discountedPrice ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-5xl font-bold text-primary" data-testid="text-discounted-price">
                    {discountedPrice.toLocaleString('ar-DZ')}
                  </span>
                  <span className="text-lg font-medium">دج</span>
                  <span className="text-2xl text-muted-foreground line-through" data-testid="text-original-price">
                    {sheep.price.toLocaleString('ar-DZ')} دج
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary" data-testid="text-price">
                    {sheep.price.toLocaleString('ar-DZ')}
                  </span>
                  <span className="text-lg font-medium">دج</span>
                </div>
              )}
            </Card>

            {/* Specifications */}
            <Card className="p-6 mb-6 border-2">
              <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                المواصفات
              </h3>
              <dl className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">العمر</dt>
                  <dd className="font-bold text-lg" data-testid="text-age">{sheep.age}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">الوزن</dt>
                  <dd className="font-bold text-lg" data-testid="text-weight">{sheep.weight}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">السلالة</dt>
                  <dd className="font-bold text-lg" data-testid="text-breed">{sheep.breed}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">الحالة الصحية</dt>
                  <dd className="font-bold text-lg" data-testid="text-health">{sheep.healthStatus}</dd>
                </div>
              </dl>
            </Card>

            {/* Description */}
            <Card className="p-6 mb-6 border-2">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                الوصف
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base" data-testid="text-description">
                {sheep.description}
              </p>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: CheckCircle, label: "جودة مضمونة" },
                { icon: Shield, label: "شهادة حلال" },
                { icon: Award, label: "خدمة ممتازة" },
              ].map((item, index) => (
                <Card key={index} className="text-center p-4 hover-elevate border-2">
                  <item.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-bold">{item.label}</p>
                </Card>
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
