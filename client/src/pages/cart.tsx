import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login (api/login) then back to checkout? 
      // For now just prompt login
      window.location.href = "/api/login";
    } else {
      setLocation("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">سلة المشتريات فارغة</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          لم تقم بإضافة أي منتجات للسلة بعد. تصفح المتجر واكتشف أفضل المنتجات الزراعية من مشاتل القادري.
        </p>
        <Link href="/products">
          <Button size="lg" className="px-8">تسوق الآن</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">سلة المشتريات</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const price = product.discountPrice || product.price;
            return (
              <div key={product.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border/60 shadow-sm">
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category.name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border rounded-md">
                      <button 
                        className="p-1 px-2 hover:bg-muted disabled:opacity-50"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button 
                        className="p-1 px-2 hover:bg-muted disabled:opacity-50"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="font-bold text-lg text-primary">
                      {(parseFloat(price) * quantity).toFixed(2)} ر.س
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={clearCart}>
            <Trash2 className="ml-2 h-4 w-4" /> إفراغ السلة
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-2xl border shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>الشحن</span>
                <span>25.00 ر.س</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-primary">{(total + 25).toFixed(2)} ر.س</span>
              </div>
            </div>

            <Button size="lg" className="w-full font-bold text-lg h-12" onClick={handleCheckout}>
              متابعة الشراء <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              جميع الأسعار تشمل ضريبة القيمة المضافة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
