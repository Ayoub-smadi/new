import { useQuery } from "@tanstack/react-query";
import { NurseryGallery } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NurseryDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: items, isLoading } = useQuery<NurseryGallery[]>({
    queryKey: ["/api/nursery"],
  });

  const item = items?.find(i => i.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">{isRtl ? "النبات غير موجود" : "Plant not found"}</h2>
        <Button onClick={() => setLocation("/nursery")} className="mt-4">
          {isRtl ? "العودة للمعرض" : "Back to Gallery"}
        </Button>
      </div>
    );
  }

  const allImages = [item.imageUrl, ...(item.additionalImages || [])];

  return (
    <div className="container py-12 px-4 max-w-6xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => setLocation("/nursery")}
        className="mb-8 gap-2 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
      >
        {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        {isRtl ? "العودة للمعرض" : "Back to Gallery"}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-xl border border-border/50">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={allImages[activeImageIndex]}
                alt={item.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {allImages.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-lg pointer-events-auto bg-white/80 backdrop-blur-sm"
                  onClick={() => setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-lg pointer-events-auto bg-white/80 backdrop-blur-sm"
                  onClick={() => setActiveImageIndex(prev => (prev + 1) % allImages.length)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-8 lg:pt-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {item.category || (isRtl ? "نبات" : "Plant")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{item.title}</h1>
            <div className="w-20 h-1.5 bg-primary/30 rounded-full mt-4" />
          </div>

          <div className="prose prose-stone dark:prose-invert max-w-none">
            <h3 className="text-xl font-bold text-foreground mb-4">
              {isRtl ? "الوصف" : "Description"}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
