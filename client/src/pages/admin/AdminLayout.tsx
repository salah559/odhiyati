import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link, Route, Switch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminManagers from "./AdminManagers";

const adminRoutes = [
  {
    path: "/admin",
    label: "لوحة الإدارة",
    icon: LayoutDashboard,
    component: AdminDashboard,
  },
  {
    path: "/admin/products",
    label: "المنتجات",
    icon: Package,
    component: AdminProducts,
  },
  {
    path: "/admin/orders",
    label: "الطلبات",
    icon: ShoppingCart,
    component: AdminOrders,
  },
  {
    path: "/admin/managers",
    label: "المدراء",
    icon: Users,
    component: AdminManagers,
  },
];

function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="space-y-2">
      {adminRoutes.map((route) => (
        <Link key={route.path} href={route.path}>
          <Button
            variant={location === route.path ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
            data-testid={`link-${route.path.split('/').pop() || 'dashboard'}`}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-16 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">لا تملك صلاحية الوصول</h2>
          <p className="text-muted-foreground mb-6">
            هذه الصفحة مخصصة للمدراء فقط
          </p>
          <Link href="/">
            <Button>العودة للصفحة الرئيسية</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold">لوحة الإدارة</h2>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-sidebar-toggle">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-6">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 md:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="p-4">
                <Sidebar />
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Switch>
              {adminRoutes.map((route) => (
                <Route key={route.path} path={route.path} component={route.component} />
              ))}
            </Switch>
          </main>
        </div>
      </div>
    </div>
  );
}
