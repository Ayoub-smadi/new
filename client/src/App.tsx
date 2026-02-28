import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart-provider";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/products/index";
import ProductDetailPage from "@/pages/products/[id]";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import DashboardPage from "@/pages/dashboard";
import NurseryPage from "@/pages/nursery";
import NurseryDetailPage from "@/pages/nursery/[id]";
import BranchesPage from "@/pages/branches";
import AuthPage from "@/pages/auth-page";

import { useQuery } from "@tanstack/react-query";
import { type SiteSetting } from "@shared/schema";
import { Mail, Phone } from "lucide-react";

const AboutPage = () => {
  const { data: settings } = useQuery<SiteSetting[]>({ queryKey: ["/api/site-settings"] });
  const content = settings?.find(s => s.key === "about_content")?.value || "مشاتل القادري هي شركة رائدة في مجال المستلزمات الزراعية، نسعى لتمكين المزارعين من خلال توفير أفضل المنتجات والحلول الزراعية المبتكرة.";
  
  return (
    <div className="container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">من نحن</h1>
      <p className="max-w-2xl mx-auto text-muted-foreground whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
};

const ContactPage = () => {
  const { data: settings } = useQuery<SiteSetting[]>({ queryKey: ["/api/site-settings"] });
  const email = settings?.find(s => s.key === "contact_email")?.value || "support@murooj.com";
  const phone = settings?.find(s => s.key === "contact_phone")?.value || "+962 000 000 000";

  return (
    <div className="container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">اتصل بنا</h1>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <p>يمكنك التواصل معنا عبر البريد الإلكتروني: {email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <p>أو عبر الهاتف: {phone}</p>
        </div>
      </div>
    </div>
  );
};

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/admin" component={DashboardPage} />
        <Route path="/nursery" component={NurseryPage} />
        <Route path="/nursery/:id" component={NurseryDetailPage} />
        <Route path="/branches" component={BranchesPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="murooj-theme">
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
