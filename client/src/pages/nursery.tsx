import { useQuery, useMutation } from "@tanstack/react-query";
import { NurseryGallery, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";

export default function NurseryPage() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: items, isLoading } = useQuery<NurseryGallery[]>({
    queryKey: ["/api/nursery"],
  });

  const plantCategories = Array.from(new Set(items?.map(item => item.category).filter(Boolean))) as string[];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = selectedCategory 
    ? items?.filter(item => item.category === selectedCategory)
    : items;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/nursery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nursery"] });
      toast({ title: isRtl ? "تم الحذف بنجاح" : "Deleted successfully" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-16 px-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          {isRtl ? "معرض المشتل" : "Nursery Gallery"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isRtl 
            ? "اكتشف تشكيلتنا الواسعة من النباتات المميزة" 
            : "Explore our wide range of premium plants"}
        </p>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-4" />
      </motion.div>

      {/* Categories Section */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`border rounded-xl p-4 cursor-pointer text-center transition-colors ${
              selectedCategory === null 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-primary/5 hover:bg-primary/10 border-primary/10 text-primary"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            <h3 className="font-bold">{isRtl ? "الكل" : "All"}</h3>
          </motion.div>
          {plantCategories?.map((category) => (
            <motion.div
              key={category}
              whileHover={{ scale: 1.05 }}
              className={`border rounded-xl p-4 cursor-pointer text-center transition-colors ${
                selectedCategory === category 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-primary/5 hover:bg-primary/10 border-primary/10 text-primary"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <h3 className="font-bold">{category}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredItems?.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="group overflow-hidden border border-border/40 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl"
            >
              <CardContent className="p-0">
                <div 
                  className="aspect-[4/5] overflow-hidden cursor-pointer relative"
                  onClick={() => setLocation(`/nursery/${item.id}`)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                      <ArrowRight className={`h-4 w-4 text-primary ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-bold text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs text-primary font-semibold"
                      onClick={() => setLocation(`/nursery/${item.id}`)}
                    >
                      {isRtl ? "التفاصيل" : "Details"}
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {items?.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">
            {isRtl ? "لا توجد نباتات حالياً." : "No plants available."}
          </p>
        </div>
      )}
    </div>
  );
}
