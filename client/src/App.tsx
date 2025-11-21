import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Login from "@/pages/Login";
import DownloadApp from "@/pages/DownloadApp";
import AdminLayout from "@/pages/admin/AdminLayout";

function Router() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {() => {
          if (!user) {
            return <Redirect to="/login" />;
          }
          return (
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Home />
              </main>
              <Footer />
            </div>
          );
        }}
      </Route>
      <Route path="/products">
        {() => (
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Products />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/products/:id">
        {() => (
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <ProductDetail />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/download">
        {() => (
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <DownloadApp />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <AdminLayout />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/:rest+">
        {() => (
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <AdminLayout />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route>
        {() => (
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <NotFound />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
