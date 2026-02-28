import { useQuery } from "@tanstack/react-query";
import { Branch } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function BranchesPage() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
          {isRtl ? "فروعنا" : "Our Branches"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isRtl 
            ? "تفضل بزيارتنا في أحد فروعنا المنتشرة لخدمتكم" 
            : "Visit us at one of our branches located to serve you"}
        </p>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches?.map((branch, index) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border border-border/40 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl group">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={branch.imageUrl} 
                  alt={branch.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {branch.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {branch.description}
                </p>
                <Button 
                  className="w-full gap-2 text-lg h-12"
                  onClick={() => window.open(branch.locationUrl, "_blank")}
                >
                  {isRtl ? "عرض الموقع على الخريطة" : "View on Google Maps"}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {branches?.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">
            {isRtl ? "سيتم إضافة الفروع قريباً." : "Branches will be added soon."}
          </p>
        </div>
      )}
    </div>
  );
}
