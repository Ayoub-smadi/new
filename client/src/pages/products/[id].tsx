import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoute } from "wouter";
import { ShoppingCart, Star, Check, Truck, Shield, Minus, Plus } from "lucide-react";
import { useState } from "react";
import NotFound from "@/pages/not-found";

export default function ProductDetailPage() {
  const [match, params] = useRoute("/products/:id");
  const id = params?.id || "";
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <ProductSkeleton />;
  if (!product) return <NotFound />;

  const price = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : null;

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border/50 relative">
             <img 
               src={product.imageUrl} 
               alt={product.name} 
               className="w-full h-full object-cover"
             />
             {product.discountPrice && (
               <Badge className="absolute top-4 right-4 bg-destructive text-white text-lg px-3 py-1">
                 خصم مميز
               </Badge>
             )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-primary hover:bg-secondary">
                {product.category.name}
              </Badge>
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  متوفر في المخزون
                </Badge>
              ) : (
                <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
                  نفذت الكمية
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-bold text-yellow-700">{product.rating}</span>
                <span className="text-muted-foreground text-sm mr-1">({product.reviewsCount} تقييم)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-bold text-primary">{price} <span className="text-lg">د.أ</span></span>
              {originalPrice && (
                <span className="text-xl text-muted-foreground line-through decoration-destructive/40">
                  {originalPrice} د.أ
                </span>
              )}
            </div>

            <div className="prose prose-stone max-w-none text-muted-foreground mb-8">
              <p>{product.description}</p>
            </div>

            <div className="space-y-6 pt-6 border-t border-dashed">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg bg-background">
                  <button 
                    className="p-3 hover:bg-muted rounded-r-lg disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    className="p-3 hover:bg-muted rounded-l-lg disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button 
                  size="lg" 
                  className="flex-1 text-lg h-12 gap-2"
                  onClick={() => addItem(product, quantity)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock > 0 ? "أضف إلى السلة" : "غير متوفر"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">شحن سريع</h4>
                  <p className="text-xs text-muted-foreground">توصيل خلال 2-4 أيام عمل</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">ضمان الجودة</h4>
                  <p className="text-xs text-muted-foreground">استرجاع مجاني خلال 14 يوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="details" 
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-lg"
            >
              تفاصيل المنتج
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-lg"
            >
              التقييمات
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-8">
            <div className="bg-card p-6 rounded-2xl border">
              <h3 className="text-xl font-bold mb-4">وصف المنتج</h3>
              <p className="text-muted-foreground leading-loose">{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-8">
            <div className="bg-card p-8 rounded-2xl border text-center py-12">
               <h3 className="text-xl font-bold mb-2">لا توجد تقييمات بعد</h3>
               <p className="text-muted-foreground">كن أول من يقيم هذا المنتج</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
