import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Star, Shield, Zap, Heart } from "lucide-react";

export default function DownloadApp() {
  const handleDownload = () => {
    window.location.href = '/api/download-app';
  };

  const features = [
    {
      icon: Zap,
      title: "سريع وسهل",
      description: "تصفح واطلب أضحيتك في دقائق معدودة"
    },
    {
      icon: Shield,
      title: "آمن وموثوق",
      description: "نضمن لك أعلى معايير الأمان في التعاملات"
    },
    {
      icon: Star,
      title: "أضاحي مميزة",
      description: "اختر من بين أفضل الأضاحي المتوفرة"
    },
    {
      icon: Heart,
      title: "خدمة متميزة",
      description: "فريق دعم متاح لخدمتك في أي وقت"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-6">
            <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            حمّل تطبيق أضحيتي
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            احصل على أفضل تجربة لطلب الأضاحي من خلال تطبيقنا المميز على هاتفك المحمول
          </p>
        </div>

        {/* Download Card */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl sm:text-3xl mb-2">تطبيق أندرويد</CardTitle>
            <CardDescription className="text-base">
              متوافق مع جميع أجهزة أندرويد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-md p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الحجم</span>
                <span className="font-medium">متوسط الحجم</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الإصدار</span>
                <span className="font-medium">الإصدار الأحدث</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">متطلبات النظام</span>
                <span className="font-medium">أندرويد 5.0 فما فوق</span>
              </div>
            </div>

            <Button 
              onClick={handleDownload}
              size="lg"
              className="w-full gap-2 text-lg h-12"
              data-testid="button-download-app"
            >
              <Download className="w-5 h-5" />
              تحميل التطبيق (APK)
            </Button>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>ملاحظة:</strong> قد تحتاج إلى السماح بتثبيت التطبيقات من مصادر غير معروفة في إعدادات هاتفك لتثبيت التطبيق.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            مميزات التطبيق
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Installation Steps */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">خطوات التثبيت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">اضغط على زر التحميل</h4>
                  <p className="text-sm text-muted-foreground">
                    انقر على زر "تحميل التطبيق" أعلاه لتحميل ملف APK
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">فعّل مصادر غير معروفة</h4>
                  <p className="text-sm text-muted-foreground">
                    انتقل إلى الإعدادات &gt; الأمان &gt; وفعّل "مصادر غير معروفة"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">افتح الملف وثبّت</h4>
                  <p className="text-sm text-muted-foreground">
                    افتح ملف APK المحمّل واتبع التعليمات لإكمال التثبيت
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">استمتع بالتطبيق</h4>
                  <p className="text-sm text-muted-foreground">
                    بعد التثبيت، افتح التطبيق واستمتع بتجربة رائعة
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
