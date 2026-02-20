import { useState, useEffect, ReactNode } from 'react';
import { CartContext, type CartItem } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('agri_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('agri_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    setItems(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, product.stock);
        if (newQuantity === existing.quantity) {
           toast({
            title: "وصلت للحد الأقصى",
            description: "لا توجد كمية كافية في المخزون",
            variant: "destructive"
          });
          return current;
        }
        return current.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      toast({
        title: "تمت الإضافة",
        description: `تم إضافة ${product.name} إلى السلة`,
        className: "bg-primary text-primary-foreground"
      });
      return [...current, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(current => 
      current.map(item => {
        if (item.product.id === productId) {
           const validQuantity = Math.min(Math.max(0, quantity), item.product.stock);
           return { ...item, quantity: validQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => {
    const price = item.product.discountPrice 
      ? parseFloat(item.product.discountPrice) 
      : parseFloat(item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
