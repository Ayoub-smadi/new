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
import { Leaf } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-8 text-primary font-bold text-3xl">
        <Leaf className="h-10 w-10" />
        <span>{t('hero.brand')}</span>
      </div>
      
      <Card className="w-full max-max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('auth.title')}</CardTitle>
          <CardDescription>
            {t('auth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t('common.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('common.signup')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input id="login-email" name="email" type="email" required placeholder="example@murooj.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoginLoading}>
                  {isLoginLoading ? t('common.loading') : t('common.login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t('auth.email')}</Label>
                  <Input id="register-email" name="email" type="email" required placeholder="example@murooj.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">{t('auth.password')}</Label>
                  <Input id="register-password" name="password" type="password" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                  {isRegisterLoading ? t('common.loading') : t('common.signup')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
