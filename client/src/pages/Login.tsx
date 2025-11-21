import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signOut } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { SiGoogle } from "react-icons/si";
import { ShoppingCart, Store } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import type { UserType, User } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

  const createOrUpdateProfile = useMutation({
    mutationFn: async ({ uid, email, displayName, photoURL, userType }: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
      userType: UserType;
    }): Promise<User> => {
      const createRes = await apiRequest("/api/users", "POST", {
        uid,
        email,
        displayName,
        photoURL,
        userType,
      });

      if (!createRes.ok) {
        if (createRes.status === 400) {
          const updateRes = await apiRequest(`/api/users/${uid}`, "PATCH", { userType });
          if (!updateRes.ok) {
            const errorData = await updateRes.json();
            throw new Error(errorData.message || "فشل في تحديث نوع الحساب");
          }
          return await updateRes.json();
        } else {
          const errorData = await createRes.json();
          throw new Error(errorData.message || "فشل في إنشاء الحساب");
        }
      }
      
      return await createRes.json();
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(['/api/users', data.uid], data);
      await queryClient.invalidateQueries({ queryKey: ['/api/users', data.uid] });
    },
  });

  useEffect(() => {
    if (user && user.userType) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleGoogleSignIn = async () => {
    if (!selectedUserType) {
      toast({
        title: "يرجى الاختيار",
        description: "الرجاء اختيار نوع الحساب قبل المتابعة",
        variant: "destructive",
      });
      return;
    }

    try {
      const firebaseUser = await signInWithGoogle();
      
      const profile = await createOrUpdateProfile.mutateAsync({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        userType: selectedUserType,
      });

      const roleText = profile.userType === "buyer" ? "مشتري" : 
                        profile.userType === "seller" ? "بائع" : "مشرف";
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `أنت الآن تستخدم التطبيق كـ${roleText}`,
      });
    } catch (error: any) {
      try {
        await signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGuestLogin = async () => {
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const profile = await createOrUpdateProfile.mutateAsync({
        uid: guestId,
        email: null,
        displayName: "زائر",
        photoURL: null,
        userType: "guest",
      });

      localStorage.setItem('guestUser', JSON.stringify(profile));
      queryClient.setQueryData(['/api/users', guestId], profile);
      
      // Notify AuthContext about the guest user update
      window.dispatchEvent(new Event('guestUserUpdated'));
      
      toast({
        title: "تم الدخول كزائر",
        description: "يمكنك تصفح المنتجات والطلب بدون حساب",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في الدخول كزائر",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2">أضحيتي</CardTitle>
          <CardDescription>اختر نوع حسابك ثم سجل الدخول</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">اختر نوع الحساب:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedUserType === "buyer" ? "default" : "outline"}
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setSelectedUserType("buyer")}
                data-testid="button-select-buyer"
              >
                <ShoppingCart className="h-8 w-8" />
                <span className="font-semibold">مشتري</span>
                <span className="text-xs opacity-80">أبحث عن أضحية</span>
              </Button>
              <Button
                variant={selectedUserType === "seller" ? "default" : "outline"}
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setSelectedUserType("seller")}
                data-testid="button-select-seller"
              >
                <Store className="h-8 w-8" />
                <span className="font-semibold">بائع</span>
                <span className="text-xs opacity-80">أبيع الأضاحي</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">ثم</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={createOrUpdateProfile.isPending || !selectedUserType}
            data-testid="button-google-signin"
          >
            <SiGoogle className="h-5 w-5" />
            {createOrUpdateProfile.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول بواسطة Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGuestLogin}
            disabled={createOrUpdateProfile.isPending}
            data-testid="button-guest-login"
          >
            {createOrUpdateProfile.isPending ? "جاري الدخول..." : "الدخول كزائر"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
