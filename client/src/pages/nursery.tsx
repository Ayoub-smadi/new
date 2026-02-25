import { useQuery, useMutation } from "@tanstack/react-query";
import { NurseryGallery } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function NurseryPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [selectedItem, setSelectedItem] = useState<NurseryGallery | null>(null);

  const { data: items, isLoading } = useQuery<NurseryGallery[]>({
    queryKey: ["/api/nursery"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/nursery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nursery"] });
      toast({ title: isRtl ? "تم الحذف بنجاح" : "Deleted successfully" });
      setSelectedItem(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{isRtl ? "نباتات المشتل" : "Nursery Plants"}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isRtl 
            ? "استكشف مجموعة من أجمل النباتات المتوفرة في مشاتلنا." 
            : "Explore a collection of the most beautiful plants available in our nurseries."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items?.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedItem(item)}
          >
            <CardContent className="p-0 relative aspect-[4/5]">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                <p className="text-sm opacity-90 line-clamp-1">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none">
          {selectedItem && (
            <div className="flex flex-col">
              <div className="relative aspect-video w-full">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-primary">{selectedItem.title}</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>

                {selectedItem.additionalImages && selectedItem.additionalImages.length > 0 && (
                  <div className="space-y-6 pt-4 border-t">
                    <h4 className="text-xl font-semibold">
                      {isRtl ? "صور إضافية" : "Additional Images"}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedItem.additionalImages.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border shadow-sm group">
                          <img 
                            src={img} 
                            alt={`${selectedItem.title} ${idx}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex justify-end pt-8 border-t">
                    <Button 
                      variant="destructive" 
                      onClick={() => deleteMutation.mutate(selectedItem.id)}
                      disabled={deleteMutation.isPending}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isRtl ? "حذف من المشتل" : "Delete from Nursery"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {items?.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          {isRtl ? "لا توجد نباتات حالياً في المعرض." : "No plants in the gallery currently."}
        </div>
      )}
    </div>
  );
}
