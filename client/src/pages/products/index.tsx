import { Product, Category, SubCategory } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useProducts, useCategories } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Filter, X, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function ProductsPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialFeatured = searchParams.get("featured") === "true";

  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [subCategoryId, setSubCategoryId] = useState("");
  
  // Debounced search could be implemented here, simplified for MVP
  const { data: products, isLoading } = useProducts({ 
    search: search || undefined, 
    categoryId: categoryId || undefined,
    subCategoryId: subCategoryId || undefined,
    featured: initialFeatured || undefined
  });
  
  const { data: categories } = useCategories();
  const { data: subCategories } = useQuery<SubCategory[]>({
    queryKey: [categoryId ? `/api/categories/${categoryId}/sub-categories` : "/api/sub-categories"],
    enabled: !!categoryId,
  });
  const { addItem } = useCart();

  const handleCategoryChange = (id: string) => {
    setCategoryId(id === categoryId ? "" : id);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setLocation("/products");
  };

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">المتجر</h1>
          <p className="text-muted-foreground mt-1">تصفح أفضل المنتجات الزراعية</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن منتج..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>تصفية المنتجات</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">التصنيفات</h3>
                    <div className="flex flex-col gap-2">
                      {categories?.map(cat => (
                        <div key={cat.id} className="flex flex-col gap-1">
                          <Button 
                            variant={categoryId === cat.id ? "default" : "ghost"} 
                            className="justify-start"
                            onClick={() => {
                              setCategoryId(cat.id === categoryId ? "" : cat.id);
                              setSubCategoryId("");
                            }}
                          >
                            {cat.name}
                          </Button>
                          {categoryId === cat.id && subCategories && subCategories.length > 0 && (
                            <div className="mr-4 flex flex-col gap-1 border-r-2 border-primary/20 pr-2">
                              {subCategories.map(sub => (
                                <Button
                                  key={sub.id}
                                  variant={subCategoryId === sub.id ? "secondary" : "ghost"}
                                  size="sm"
                                  className="justify-start h-8 text-xs"
                                  onClick={() => setSubCategoryId(sub.id === subCategoryId ? "" : sub.id)}
                                >
                                  {sub.name}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                </div>
                {(categoryId || search) && (
                  <Button variant="destructive" className="w-full" onClick={clearFilters}>
                    مسح التصفيات
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block w-64 shrink-0 space-y-8">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> التصنيفات
            </h3>
            <div className="space-y-2">
              <div 
                className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${!categoryId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                onClick={() => {
                  setCategoryId("");
                  setSubCategoryId("");
                }}
              >
                الكل
              </div>
              {categories?.map(cat => (
                <div key={cat.id}>
                  <div 
                    className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${categoryId === cat.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setSubCategoryId("");
                    }}
                  >
                    {cat.name}
                  </div>
                  {categoryId === cat.id && subCategories && subCategories.length > 0 && (
                    <div className="mr-4 mt-1 space-y-1 border-r-2 border-primary/20 pr-2">
                      {subCategories.map(sub => (
                        <div 
                          key={sub.id}
                          className={`cursor-pointer px-2 py-1 rounded text-sm transition-colors ${subCategoryId === sub.id ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"}`}
                          onClick={() => setSubCategoryId(sub.id === subCategoryId ? "" : sub.id)}
                        >
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {(categoryId || search) && (
            <Button variant="outline" className="w-full border-dashed" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" /> مسح التصفيات
            </Button>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground mb-6">لم نتمكن من العثور على أي منتجات تطابق بحثك.</p>
              <Button onClick={clearFilters}>عرض كل المنتجات</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-border/60">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg border-2 border-white px-4 py-1 rounded-md transform -rotate-12">نفذت الكمية</span>
                        </div>
                      )}
                      {product.discountPrice && product.stock > 0 && (
                        <Badge className="absolute top-2 right-2 bg-destructive text-white shadow-sm">
                          وفر {Math.round((1 - parseFloat(product.discountPrice) / parseFloat(product.price)) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4 flex-1 flex flex-col items-center text-center">
                    <Link href={`/products/${product.id}`} className="w-full">
                      <h3 className="font-bold text-xl mb-3 hover:text-primary transition-colors cursor-pointer line-clamp-2 min-h-[3.5rem] w-full text-foreground">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center mb-4 w-full px-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {product.category.name}
                      </span>
                      <div className="flex items-center text-yellow-500 text-sm font-bold">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {product.rating}
                      </div>
                    </div>
                    <div className="flex items-baseline justify-center gap-2 mt-auto w-full bg-muted/30 py-2 rounded-lg">
                      <span className="text-2xl font-black text-primary">
                        {product.discountPrice || product.price} <span className="text-xs font-normal text-muted-foreground">د.أ</span>
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                          {product.price}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full gap-2 font-semibold" 
                      onClick={() => addItem(product)}
                      disabled={product.stock <= 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock > 0 ? "أضف للسلة" : "غير متوفر"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
