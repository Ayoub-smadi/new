import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Leaf, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // If already logged in, redirect to home
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const user = await login({ email, password });
      toast({
        title: t('auth.login_success'),
        description: t('auth.welcome_back'),
      });
      
      // Redirect based on role
      if (user.role === 'admin') {
        setLocation("/dashboard");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: t('auth.login_failed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      await register({ email, password, firstName, lastName });
      toast({
        title: t('auth.register_success'),
        description: t('auth.account_created'),
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: t('auth.register_failed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("register") === "true" ? "register" : "login";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Decorative Section */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735" 
            alt="Nursery background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent" />
        </div>
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-white font-bold text-3xl"
          >
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <span>{t('hero.brand')}</span>
          </motion.div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold leading-tight mb-6"
          >
            ازرع مستقبلك <br />
            <span className="text-white/80">مع مروج لاند</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/70 leading-relaxed"
          >
            انضم إلينا اليوم واكتشف عالم الجمال الطبيعي. نوفر لك أفضل النباتات والأدوات الزراعية لتحويل مساحتك إلى جنة خضراء.
          </motion.p>
        </div>

        <div className="relative z-10 flex gap-8 text-white/60">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">1000+</span>
            <span className="text-sm">نوع من النباتات</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">50k+</span>
            <span className="text-sm">عميل سعيد</span>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2 lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Leaf className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-primary">{t('hero.brand')}</h2>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('auth.title')}</h1>
            <p className="text-muted-foreground">{t('auth.description')}</p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-8">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <LogIn className="h-4 w-4 mr-2" />
                {t('common.login')}
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('common.signup')}
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="login" key="login" className="mt-0 outline-none">
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin} 
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">{t('auth.email')}</Label>
                    <Input 
                      id="login-email" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="example@murooj.com"
                      className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <Button variant="link" className="px-0 font-normal text-primary h-auto">نسيت كلمة المرور؟</Button>
                    </div>
                    <Input 
                      id="login-password" 
                      name="password" 
                      type="password" 
                      required 
                      className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-semibold group" disabled={isLoginLoading}>
                    {isLoginLoading ? (
                      <span className="flex items-center gap-2">جارِ تسجيل الدخول...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {t('common.login')}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
              
              <TabsContent value="register" key="register" className="mt-0 outline-none">
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister} 
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        required 
                        className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        required 
                        className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t('auth.email')}</Label>
                    <Input 
                      id="register-email" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="example@murooj.com"
                      className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t('auth.password')}</Label>
                    <Input 
                      id="register-password" 
                      name="password" 
                      type="password" 
                      required 
                      minLength={6}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-semibold group" disabled={isRegisterLoading}>
                    {isRegisterLoading ? (
                      <span className="flex items-center gap-2">جارِ إنشاء الحساب...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {t('common.signup')}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground px-8">
            من خلال الاستمرار، فإنك توافق على <Button variant="link" className="p-0 h-auto font-normal">شروط الخدمة</Button> و <Button variant="link" className="p-0 h-auto font-normal">سياسة الخصوصية</Button>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
