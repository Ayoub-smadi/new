import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSocialLinkSchema, type SocialLink } from "@shared/schema";
import { Loader2, Plus, Trash2, Facebook, Instagram, Twitter, Youtube, Send, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  whatsapp: Send,
  tiktok: Globe,
  default: Globe
};

export default function SocialLinksManager() {
  const { toast } = useToast();
  const { data: links, isLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      console.log("Sending values:", values);
      const res = await apiRequest("POST", "/api/social-links", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "تمت الإضافة بنجاح" });
      form.reset();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "فشل الإضافة", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/social-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertSocialLinkSchema),
    defaultValues: {
      platform: "",
      url: "",
      icon: "default",
      isEnabled: true,
    },
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إضافة رابط جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(
                (data) => createMutation.mutate(data),
                (errors) => console.log("Form errors:", errors)
              )} 
              className="flex gap-4 items-end"
            >
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>المنصة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: Facebook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>الرابط</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                إضافة
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links?.map((link) => {
          const Icon = ICON_MAP[link.platform.toLowerCase()] || ICON_MAP.default;
          return (
            <Card key={link.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{link.platform}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{link.url}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(link.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
