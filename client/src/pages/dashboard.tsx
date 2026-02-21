import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle, Plus, Edit, Trash2, LayoutDashboard, Settings } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category, insertProductSchema, insertCategorySchema } from "@shared/schema";
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
import { useState } from "react";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const categoryForm = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      toast({ title: "تم إضافة التصنيف بنجاح" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم حذف التصنيف بنجاح" });
    },
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم تحديث حالة الطلب بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "فشل تحديث الطلب", 
        description: error.message,
        variant: "destructive" 
      });
    }
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
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة تصنيف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit((data) => categoryMutation.mutate(data))} className="space-y-4 text-right">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم التصنيف</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl><Textarea {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>صورة التصنيف</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
                                      const res = await fetch("/api/upload", {
                                        method: "POST",
                                        body: formData,
                                      });
                                      if (res.ok) {
                                        const data = await res.json();
                                        field.onChange(data.url);
                                        toast({ title: "تم رفع الصورة بنجاح" });
                                      } else {
                                        toast({ title: "فشل رفع الصورة", variant: "destructive" });
                                      }
                                    } catch (error) {
                                      toast({ title: "خطأ في الاتصال بالسيرفر", variant: "destructive" });
                                    }
                                  }
                                }}
                              />
                              {field.value && (
                                <div className="relative w-20 h-20 rounded border overflow-hidden">
                                  <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <Input {...field} placeholder="أو أدخل رابط الصورة هنا" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={categoryMutation.isPending}>
                      {categoryMutation.isPending ? <Loader2 className="animate-spin" /> : "حفظ التصنيف"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

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
                          <FormLabel>صورة المنتج</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
                                      const res = await fetch("/api/upload", {
                                        method: "POST",
                                        body: formData,
                                      });
                                      if (res.ok) {
                                        const data = await res.json();
                                        field.onChange(data.url);
                                        toast({ title: "تم رفع الصورة بنجاح" });
                                      } else {
                                        toast({ title: "فشل رفع الصورة", variant: "destructive" });
                                      }
                                    } catch (error) {
                                      toast({ title: "خطأ في الاتصال بالسيرفر", variant: "destructive" });
                                    }
                                  }
                                }}
                              />
                              {field.value && (
                                <div className="relative w-20 h-20 rounded border overflow-hidden">
                                  <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <Input {...field} placeholder="أو أدخل رابط الصورة هنا" />
                            </div>
                          </FormControl>
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
              <Settings className="h-5 w-5" /> إدارة التصنيفات
            </h2>
            <div className="bg-card border rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-muted text-muted-foreground font-medium border-b">
                    <tr>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">الوصف</th>
                      <th className="p-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories?.map((category) => (
                      <tr key={category.id}>
                        <td className="p-4 flex items-center gap-3">
                          <img src={category.imageUrl || ""} className="w-8 h-8 rounded object-cover" alt="" />
                          <span className="font-medium">{category.name}</span>
                        </td>
                        <td className="p-4">{category.description}</td>
                        <td className="p-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive" 
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع المنتجات المرتبطة به.")) {
                                deleteCategoryMutation.mutate(category.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

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

          {isAdmin && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground mb-1">إجمالي الطلبات</span>
                  <span className="text-2xl font-bold">{orders?.length || 0}</span>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground mb-1">قيد المعالجة</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {orders?.filter(o => o.status === 'processing').length || 0}
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground mb-1">تم التوصيل</span>
                  <span className="text-2xl font-bold text-green-600">
                    {orders?.filter(o => o.status === 'delivered').length || 0}
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground mb-1">تم الشحن</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {orders?.filter(o => o.status === 'shipped').length || 0}
                  </span>
                </CardContent>
              </Card>
            </div>
          )}

          {isAdmin && (
            <div className="mb-4 flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
              <span className="text-sm font-medium">إدارة حالات الطلبات</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
              >
                تحديث البيانات
              </Button>
            </div>
          )}

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
                    {isAdmin && (
                      <div className="flex gap-1 mr-2" dir="ltr">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] px-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                          onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'processing' })}
                        >
                          معالجة
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] px-2 bg-blue-100 hover:bg-blue-200 text-blue-800"
                          onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'shipped' })}
                        >
                          شحن
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] px-2 bg-green-100 hover:bg-green-200 text-green-800"
                          onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'delivered' })}
                        >
                          توصيل
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] px-2 bg-red-100 hover:bg-red-200 text-red-800"
                          onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'cancelled' })}
                        >
                          إلغاء
                        </Button>
                      </div>
                    )}
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
