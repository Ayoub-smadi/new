import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Menu, X, Leaf, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.email?.includes("admin") || false; // Simple check for MVP

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/products", label: "المتجر" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "اتصل بنا" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Leaf className="h-6 w-6" />
                    <span>مروج الخضراء</span>
                  </div>
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <div 
                          className={`text-lg font-medium transition-colors hover:text-primary cursor-pointer ${
                            location === link.href ? "text-primary" : "text-muted-foreground"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </div>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/">
              <div className="flex items-center gap-2 font-bold text-2xl text-primary cursor-pointer mr-4">
                <Leaf className="h-8 w-8" />
                <span className="hidden sm:inline-block">مروج الخضراء</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 mr-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {link.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs bg-accent text-white border-2 border-background">
                    {count}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || "User"} 
                        className="h-8 w-8 rounded-full object-cover border border-border" 
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-right">مرحباً، {user.firstName || "مستخدم"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer justify-end">
                      لوحة التحكم
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer justify-end">
                         إدارة المتجر <LayoutDashboard className="ml-2 h-4 w-4" />
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive justify-end focus:text-destructive"
                    onClick={() => logout()}
                  >
                     تسجيل الخروج <LogOut className="ml-2 h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" className="gap-2">
                <a href="/api/login">
                  تسجيل الدخول <User className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl text-primary">
                <Leaf className="h-6 w-6" />
                <span>مروج الخضراء</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                وجهتك الأولى للمنتجات الزراعية عالية الجودة. نوفر البذور، الأسمدة، والمعدات لمساعدة مزرعتك على الازدهار.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products">المتجر</Link></li>
                <li><Link href="/about">من نحن</Link></li>
                <li><Link href="/contact">اتصل بنا</Link></li>
                <li><Link href="/privacy">سياسة الخصوصية</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>الرياض، المملكة العربية السعودية</li>
                <li>info@murooj.com</li>
                <li dir="ltr">+966 11 123 4567</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">اشترك في النشرة</h3>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="بريدك الإلكتروني" 
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                />
                <Button size="sm">اشتراك</Button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} مروج الخضراء. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
