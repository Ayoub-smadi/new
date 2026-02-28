import { useQuery, useMutation } from "@tanstack/react-query";
import { NurseryGallery } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function NurseryPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [selectedItem, setSelectedItem] = useState<NurseryGallery | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: items, isLoading } = useQuery<NurseryGallery[]>({
    queryKey: ["/api/nursery"],
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");

  const categories = ["الكل", "زينة", "اشجار", "شجيرات", "نباتات"];

  const filteredItems = items?.filter(item => 
    selectedCategory === "الكل" || 
    (item.category === selectedCategory) || 
    (item.type === selectedCategory)
  );

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

  // Reset image index when selecting a new item
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedItem]);

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

  const allImages = selectedItem ? [selectedItem.imageUrl, ...(selectedItem.additionalImages || [])] : [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="container py-16 px-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {isRtl ? "معرض المشتل المميز" : "Premium Nursery Gallery"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
          {isRtl 
            ? "نباتات مختارة بعناية لتضفي لمسة من الطبيعة والجمال على مساحتك الخاصة." 
            : "Carefully selected plants to add a touch of nature and beauty to your space."}
        </p>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mt-6" />
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full px-6"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems?.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="group relative overflow-hidden cursor-pointer border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl aspect-[3/4]"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-0 h-full w-full relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                    <Maximize2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                  <h3 className="text-3xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                  <p className="text-sm opacity-0 group-hover:opacity-90 line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden border-none rounded-3xl shadow-2xl bg-background/95 backdrop-blur-xl">
          {selectedItem && (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Section */}
              <div className="relative w-full lg:w-3/5 h-[50%] lg:h-full bg-black group/gallery">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={allImages[activeImageIndex]}
                    alt={`${selectedItem.title} ${activeImageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>
                
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition-all opacity-0 group-hover/gallery:opacity-100"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition-all opacity-0 group-hover/gallery:opacity-100"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'w-8 bg-primary' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-6 right-6 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md z-50 lg:hidden"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Content Section */}
              <div className="w-full lg:w-2/5 h-[50%] lg:h-full p-8 lg:p-12 overflow-y-auto flex flex-col bg-card relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-8 right-8 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full hidden lg:flex"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-6 w-6" />
                </Button>

                <div className="space-y-8 flex-grow">
                  <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
                      {selectedItem.type}
                    </span>
                    <h2 className="text-4xl font-black text-foreground leading-tight">{selectedItem.title}</h2>
                    <div className="w-16 h-1 bg-primary/30 rounded-full" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-primary rounded-full" />
                      {isRtl ? "عن هذه النبتة" : "About this plant"}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedItem.description}
                    </p>
                  </div>

                  {allImages.length > 1 && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        {isRtl ? "معرض الصور" : "Photo Gallery"}
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        {allImages.map((img, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <Button 
                      variant="destructive" 
                      onClick={() => deleteMutation.mutate(selectedItem.id)}
                      disabled={deleteMutation.isPending}
                      className="w-full py-6 rounded-2xl text-lg font-bold gap-3 shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all"
                    >
                      <Trash2 className="h-6 w-6" />
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 bg-muted/30 rounded-[3rem] border-2 border-dashed border-muted-foreground/20"
        >
          <p className="text-2xl font-bold text-muted-foreground">
            {isRtl ? "لا توجد نباتات حالياً في المعرض." : "No plants in the gallery currently."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
