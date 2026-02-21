import { useQuery, useMutation } from "@tanstack/react-query";
import { NurseryGallery, InsertNurseryGallery } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NurseryPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: items, isLoading } = useQuery<NurseryGallery[]>({
    queryKey: ["/api/nursery"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/nursery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nursery"] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const filteredItems = activeTab === "all" 
    ? items 
    : items?.filter(item => item.type === activeTab);

  return (
    <div className="container py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">معرض المشتل</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          استكشف مجموعتنا المتنوعة من النباتات والأفرع المميزة في مشاتلنا.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full mb-8" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="plant">النباتات</TabsTrigger>
            <TabsTrigger value="branch">الأفرع</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems?.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <CardContent className="p-0 relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-white text-right">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  {item.description && <p className="text-sm opacity-90">{item.description}</p>}
                  {isAdmin && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 left-4"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>

      {isAdmin && (
        <div className="mt-12 p-6 border rounded-lg bg-muted/30">
          <h2 className="text-xl font-bold mb-4">إضافة صورة جديدة</h2>
          {/* Add Form implementation would go here */}
          <p className="text-sm text-muted-foreground">لوحة التحكم تتيح إضافة المزيد من الصور للمعرض.</p>
        </div>
      )}
    </div>
  );
}