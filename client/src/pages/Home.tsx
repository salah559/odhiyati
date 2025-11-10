import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { CheckCircle, Clock, Shield, Award, Star, TrendingUp, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Sheep } from "@shared/schema";
import { getAllSheep } from "@/lib/firestore";
import heroImage from "@assets/generated_images/Hero_sheep_pastoral_4351d2e5.png";
import ramImage from "@assets/generated_images/Ram_category_image_2f96bd41.png";
import eweImage from "@assets/generated_images/Ewe_category_image_5444fe06.png";
import lambImage from "@assets/generated_images/Lamb_category_image_decc492a.png";
import logoImage from "@assets/s1s1d2piefxa_1740738175_1762784429614.png";

export default function Home() {
  const { data: sheep = [], isLoading } = useQuery<Sheep[]>({
    queryKey: ["sheep"],
    queryFn: getAllSheep,
  });

  const featuredSheep = sheep.filter(s => s.isFeatured).slice(0, 4);
  const discountedSheep = sheep.filter(s => s.discountPercentage && s.discountPercentage > 0).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-black/60 to-black/80" />
        
        {/* Islamic Pattern Overlay - Enhanced */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M40 40c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12-12-5.373-12-12zm-28 0c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12-12-5.373-12-12zM40 12c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12-12-5.373-12-12zm-28 0c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12S12 18.627 12 12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-primary/30 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-primary/30 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-primary/30 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-primary/30 rounded-br-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
          <div className="mb-8 flex justify-center">
            <img src={logoImage} alt="أضحيتي" className="h-24 w-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg" data-testid="text-hero-title">
            اختر أضحيتك المثالية
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed">
            منصة موثوقة لشراء الأغنام والأضاحي بجودة عالية وأسعار منافسة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products">
              <Button 
                size="lg" 
                className="text-lg shadow-xl"
                data-testid="button-browse-products"
              >
                تصفح المنتجات
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg bg-white/10 backdrop-blur-md border-white/30 text-white"
              data-testid="button-learn-more"
            >
              تعرف علينا
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Star, label: "جودة مضمونة", value: "100%" },
              { icon: Shield, label: "أمان وثقة", value: "24/7" },
              { icon: TrendingUp, label: "أسعار تنافسية", value: "أفضل" },
              { icon: Heart, label: "رضا العملاء", value: "عالي" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-categories-title">
            تصفح حسب الفئة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "كبش", image: ramImage, category: "كبش" },
              { name: "نعجة", image: eweImage, category: "نعجة" },
              { name: "خروف", image: lambImage, category: "خروف" },
            ].map((cat) => (
              <Link key={cat.category} href={`/products?category=${cat.category}`}>
                <div 
                  className="relative h-64 rounded-lg overflow-hidden group cursor-pointer hover-elevate active-elevate-2"
                  data-testid={`card-category-${cat.category}`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 right-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredSheep.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-featured-title">
              منتجات مميزة
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSheep.map((sheep) => (
                  <ProductCard key={sheep.id} sheep={sheep} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Special Offers */}
      {discountedSheep.length > 0 && (
        <section className="py-16 bg-accent/20">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-offers-title">
              عروض خاصة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedSheep.map((sheep) => (
                <ProductCard key={sheep.id} sheep={sheep} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Signals */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "جودة مضمونة",
                description: "جميع منتجاتنا مفحوصة ومضمونة الجودة",
              },
              {
                icon: Clock,
                title: "توصيل سريع",
                description: "خدمة توصيل سريعة وموثوقة",
              },
              {
                icon: Shield,
                title: "شهادة حلال",
                description: "جميع الأغنام مطابقة للمواصفات الشرعية",
              },
              {
                icon: Award,
                title: "خدمة عملاء ممتازة",
                description: "فريق دعم متاح على مدار الساعة",
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-lg bg-card"
                data-testid={`trust-badge-${index}`}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
