import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function Header() {
  const { user, isAdmin, isGuest } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      if (isGuest) {
        localStorage.removeItem('guestUser');
        queryClient.clear();
        toast({
          title: "تم تسجيل الخروج بنجاح",
          description: "نراك قريباً",
        });
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        await signOut();
        toast({
          title: "تم تسجيل الخروج بنجاح",
          description: "نراك قريباً",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 sm:h-20 md:h-24 items-center justify-between gap-2 sm:gap-4">
          {/* Logo - على اليمين */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">أضحيتي</span>
            </div>
          </Link>

          {/* Desktop Navigation - في الوسط */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" data-testid="link-home-nav">الرئيسية</Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" data-testid="link-products">المنتجات</Button>
            </Link>
            <Link href="/download">
              <Button variant="ghost" data-testid="link-download">حمّل التطبيق</Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="gap-2" data-testid="link-admin">
                  <ShieldCheck className="h-4 w-4" />
                  لوحة الإدارة
                </Button>
              </Link>
            )}
          </nav>

          {/* Actions - على اليسار */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-user-menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.displayName || user.email}
                    </div>
                    <DropdownMenuItem onClick={handleSignOut} data-testid="button-logout">
                      <LogOut className="ml-2 h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" data-testid="button-login">
                  تسجيل الدخول
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-2">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="link-home-mobile">
                  الرئيسية
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="link-products-mobile">
                  المنتجات
                </Button>
              </Link>
              <Link href="/download">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)} data-testid="link-download-mobile">
                  حمّل التطبيق
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setMobileMenuOpen(false)} data-testid="link-admin-mobile">
                    <ShieldCheck className="h-4 w-4" />
                    لوحة الإدارة
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}