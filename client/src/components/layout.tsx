import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Menu, X, Leaf, User, LogOut, LayoutDashboard, Sun, Moon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
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

import { useQuery } from "@tanstack/react-query";
import { SocialLink } from "@shared/schema";
import { Facebook, Instagram, Twitter, Youtube, Send, Globe } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  whatsapp: Send,
  tiktok: Globe,
  default: Globe
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const { count } = useCart();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/site-settings"],
  });

  const getSetting = (key: string, defaultValue: string) => {
    return settings?.find(s => s.key === key)?.value || defaultValue;
  };

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const navLinks = [
    { href: "/", label: t('nav.home') },
    { href: "/products", label: t('nav.shop') },
    { href: "/nursery", label: t('nav.nursery') },
    { href: "/branches", label: t('nav.branches') },
    { href: "/about", label: t('nav.about') },
    { href: "/contact", label: t('nav.contact') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? "right" : "left"} className="w-[300px]">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Leaf className="h-6 w-6" />
                    <span>{getSetting("brand_name", t('hero.brand'))}</span>
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
              <div className={`flex items-center gap-2 font-bold text-2xl text-primary cursor-pointer ${isRtl ? 'mr-4' : 'ml-4'}`}>
                <Leaf className="h-8 w-8" />
                <span className="hidden sm:inline-block">{getSetting("brand_name", t('hero.brand'))}</span>
              </div>
            </Link>

            <nav className={`hidden lg:flex items-center gap-6 ${isRtl ? 'mr-6' : 'ml-6'}`}>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={i18n.language === 'ar' ? 'English' : 'العربية'}
            >
              <Languages className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('common.switch_theme')}</span>
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <Badge className={`absolute -top-1 ${isRtl ? '-right-1' : '-left-1'} h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs bg-accent text-white border-2 border-background`}>
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
                <DropdownMenuContent align={isRtl ? "end" : "start"} className="w-56">
                  <DropdownMenuLabel className={isRtl ? "text-right" : "text-left"}>
                    {t('common.welcome')}، {user.firstName || 'User'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className={`cursor-pointer ${isRtl ? 'justify-end' : 'justify-start'}`}>
                      {isRtl ? (
                        <>{isAdmin ? t('common.dashboard') : 'حسابي'} <LayoutDashboard className="ml-2 h-4 w-4" /></>
                      ) : (
                        <><LayoutDashboard className="mr-2 h-4 w-4" /> {isAdmin ? t('common.dashboard') : 'My Account'}</>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={`cursor-pointer text-destructive focus:text-destructive ${isRtl ? 'justify-end' : 'justify-start'}`}
                    onClick={() => logout()}
                  >
                    {isRtl ? (
                      <>{t('common.logout')} <LogOut className="ml-2 h-4 w-4" /></>
                    ) : (
                      <><LogOut className="mr-2 h-4 w-4" /> {t('common.logout')}</>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    {t('common.login')}
                  </Button>
                </Link>
                <Link href="/auth?register=true">
                  <Button variant="default" size="sm">
                    {t('common.signup')}
                  </Button>
                </Link>
              </div>
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
                <span>{getSetting("brand_name", t('hero.brand'))}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getSetting("footer_description", t('footer.desc'))}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('footer.quick_links')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products">{t('nav.shop')}</Link></li>
                <li><Link href="/about">{t('nav.about')}</Link></li>
                <li><Link href="/contact">{t('nav.contact')}</Link></li>
                <li><Link href="/privacy">{t('footer.privacy')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('footer.contact_us')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{getSetting("contact_address", isRtl ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia')}</li>
                <li>{getSetting("contact_email", "info@murooj.com")}</li>
                <li dir="ltr">{getSetting("contact_phone", "+966 11 123 4567")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('footer.subscribe')}</h3>
              <div className="flex gap-2 mb-4">
                <input 
                  type="email" 
                  placeholder={t('footer.email_placeholder')} 
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                />
                <Button size="sm">{t('footer.subscribe_btn')}</Button>
              </div>
              <div className="flex gap-4">
                {socialLinks?.filter(link => link.isEnabled).map((link) => {
                  const Icon = ICON_MAP[link.platform.toLowerCase()] || ICON_MAP.default;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {getSetting("brand_name", t('hero.brand'))}. {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
