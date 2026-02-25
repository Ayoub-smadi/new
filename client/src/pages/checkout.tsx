import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Loader2, CreditCard, Banknote } from "lucide-react";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "العنوان يجب أن يكون واضحاً ومفصلاً"),
  paymentMethod: z.enum(["cod", "card"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { mutate, isPending } = useCreateOrder();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cod",
      shippingAddress: "",
      notes: ""
    }
  });

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = (data: CheckoutFormValues) => {
    mutate({
      ...data,
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    }, {
      onSuccess: () => {
        toast({
          title: "تم استلام طلبك بنجاح!",
          description: "سيتم التواصل معك قريباً لتأكيد الطلب.",
          className: "bg-green-600 text-white border-none"
        });
        clearCart();
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({
          title: "حدث خطأ",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">إتمام الطلب</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6">تفاصيل الشحن والدفع</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان التوصيل</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="المدينة، الحي، اسم الشارع، رقم المبنى..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>طريقة الدفع</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="cod" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                              <Banknote className="mb-2 h-6 w-6" />
                              الدفع عند الاستلام
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="card" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                              <CreditCard className="mb-2 h-6 w-6" />
                              بطاقة ائتمان
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="أي تعليمات خاصة للتوصيل..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full text-lg h-12" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري التنفيذ...
                    </>
                  ) : (
                    "تأكيد الطلب"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div>
          <div className="bg-muted/50 p-6 rounded-2xl border">
            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">الكمية: {quantity}</p>
                  </div>
                  <div className="font-bold">
                    {(parseFloat(product.discountPrice || product.price) * quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-dashed border-gray-300">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع</span>
                <span>{total.toFixed(2)} د.أ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>الشحن</span>
                <span>2.00 د.أ</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                <span>الإجمالي النهائي</span>
                <span className="text-primary">{(total + 2).toFixed(2)} د.أ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
