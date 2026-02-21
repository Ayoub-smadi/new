import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle, Plus, Edit, Trash2, LayoutDashboard, Settings } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { useState } from "react";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم حذف المنتج بنجاح" });
    },
  });

  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      categoryId: "",
      imageUrl: "",
      stock: 0,
      isFeatured: false,
    },
  });

  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingProduct) {
        return await apiRequest("PUT", `/api/products/${editingProduct.id}`, data);
      }
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: editingProduct ? "تم تحديث المنتج" : "تم إضافة المنتج" });
    },
  });

  const onEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      stock: product.stock,
      isFeatured: product.isFeatured || false,
    });
    setIsProductDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "shipped": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "delivered": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغي"
    };
    return map[status] || status;
  };

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
            <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              A
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">أهلاً، Ayoub</h1>
            <p className="text-muted-foreground">لوحة التحكم الخاصة بك</p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => {
                  setEditingProduct(null);
                  productForm.reset();
                }}>
                  <Plus className="h-4 w-4" /> إضافة منتج
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
                </DialogHeader>
                <Form {...productForm}>
                  <form onSubmit={productForm.handleSubmit((data) => productMutation.mutate(data))} className="space-y-4 text-right">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المنتج</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl><Textarea {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>السعر</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المخزون (الكمية)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>التصنيف</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر تصنيفاً" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رابط الصورة</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={productMutation.isPending}>
                      {productMutation.isPending ? <Loader2 className="animate-spin" /> : "حفظ المنتج"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid gap-8">
        {isAdmin && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" /> إدارة المنتجات
            </h2>
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-muted text-muted-foreground font-medium border-b">
                    <tr>
                      <th className="p-4">المنتج</th>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">المخزون</th>
                      <th className="p-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {productsLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                    ) : products?.map((product) => (
                      <tr key={product.id}>
                        <td className="p-4 flex items-center gap-3">
                          <img src={product.imageUrl} className="w-8 h-8 rounded object-cover" alt="" />
                          <span className="font-medium">{product.name}</span>
                        </td>
                        <td className="p-4">{categories?.find(c => c.id === product.categoryId)?.name}</td>
                        <td className="p-4 font-mono">{product.price} ر.س</td>
                        <td className="p-4">
                          <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEditProduct(product)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProductMutation.mutate(product.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" /> {isAdmin ? "جميع الطلبات" : "طلباتي"}
          </h2>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <p className="text-muted-foreground mb-4">لا توجد طلبات</p>
              {!isAdmin && <Button variant="outline" onClick={() => window.location.href = "/products"}>ابدأ التسوق</Button>}
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/40 py-4 flex flex-row items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono font-bold text-foreground">#{order.id.slice(0, 8)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.createdAt && format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar })}
                      </span>
                    </div>
                    <Badge variant="secondary" className={`${getStatusColor(order.status)} border-0`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                               <img src={item.product?.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product?.name}</p>
                              <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-sm">{(Number(item.priceAtTime) * item.quantity).toFixed(2)} ر.س</p>
                          </div>
                        ))}
                      </div>
                      <div className="md:w-64 space-y-2 border-t md:border-t-0 md:border-r md:pr-6 pt-4 md:pt-0 text-right">
                         <div>
                           <span className="text-xs text-muted-foreground block">عنوان التوصيل</span>
                           <p className="text-sm font-medium">{order.shippingAddress}</p>
                         </div>
                         <div>
                           <span className="text-xs text-muted-foreground block">الإجمالي</span>
                           <p className="text-lg font-bold text-primary">{order.totalAmount} ر.س</p>
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
