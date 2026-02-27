import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle, Plus, Edit, Trash2, LayoutDashboard, Settings, Truck, Globe } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category, SubCategory, ShippingRate, NurseryGallery, SiteSetting, insertProductSchema, insertCategorySchema, insertSubCategorySchema, insertShippingRateSchema, insertNurseryGallerySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
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
import { useState, useRef } from "react";

import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isAdmin, isLoading, isAuthenticated } = useAuth();

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

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const { data: orders, isLoading: ordersLoading } = useOrders();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "غير مصرح",
        description: "يرجى تسجيل الدخول للوصول إلى لوحة التحكم",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      // For regular users, if they try to access dashboard we can show them their orders
    }
  }, [isAuthenticated, isLoading, isAdmin, toast, location]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground uppercase">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">أهلاً، {user?.firstName || user?.username}</h1>
              <p className="text-muted-foreground">بيانات حسابك وطلباتك</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">البريد الإلكتروني</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">{user?.email}</div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">طلباتي الأخيرة</h2>
        {ordersLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="font-bold">طلب #{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt!), "PPP", { locale: ar })}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">{order.totalAmount} د.أ</div>
                      <div className="text-xs text-muted-foreground">{order.paymentMethod === 'cod' ? 'دفع عند الاستلام' : 'بطاقة ائتمان'}</div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Package className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">ليس لديك أي طلبات بعد</p>
            </div>
          </Card>
        )}
      </div>
    );
  }
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: shippingRates } = useQuery<ShippingRate[]>({
    queryKey: ["/api/shipping-rates"],
  });

  const { data: siteSettings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/site-settings"],
  });

  const updateSiteSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      await apiRequest("POST", "/api/site-settings", { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({ title: "تم تحديث الإعداد بنجاح" });
    },
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

  const [isNurseryDialogOpen, setIsNurseryDialogOpen] = useState(false);
  const nurseryForm = useForm({
    resolver: zodResolver(insertNurseryGallerySchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      additionalImages: [] as string[],
      type: "plant",
    },
  });

  const nurseryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/nursery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nursery"] });
      setIsNurseryDialogOpen(false);
      nurseryForm.reset();
      toast({ title: "تم إضافة النبتة بنجاح" });
    },
  });

  const { data: nurseryItems } = useQuery<NurseryGallery[]>({
    queryKey: ["/api/nursery"],
  });

  const deleteNurseryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/nursery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nursery"] });
      toast({ title: "تم حذف النبتة بنجاح" });
    },
  });
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);

  const [selectedCategoryIdForSub, setSelectedCategoryIdForSub] = useState<string>("");
  const { data: subCategories } = useQuery<SubCategory[]>({
    queryKey: [selectedCategoryIdForSub ? `/api/categories/${selectedCategoryIdForSub}/sub-categories` : "/api/sub-categories"],
    enabled: !!selectedCategoryIdForSub || isProductDialogOpen,
  });

  const subCategoryForm = useForm({
    resolver: zodResolver(insertSubCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
    },
  });

  const subCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/categories/${data.categoryId}/sub-categories`, {
        name: data.name,
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/sub-categories"] });
      setIsSubCategoryDialogOpen(false);
      subCategoryForm.reset();
      toast({ title: "تم إضافة التصنيف الفرعي بنجاح" });
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/sub/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "تم حذف التصنيف الفرعي بنجاح" });
    },
  });

  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      discountPrice: "",
      categoryId: "",
      subCategoryId: "",
      imageUrl: "",
      additionalImages: [] as string[],
      stock: 0,
      isFeatured: false,
    },
  });

  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      const formattedData = {
        ...data,
        price: data.price.toString(),
        discountPrice: (data.discountPrice && data.discountPrice !== "") ? data.discountPrice.toString() : null,
        stock: parseInt(data.stock.toString()) || 0,
        subCategoryId: (data.subCategoryId === "none" || !data.subCategoryId) ? null : data.subCategoryId,
        additionalImages: data.additionalImages || [],
      };
      console.log("Sending formatted data:", formattedData);
      if (editingProduct) {
        return await apiRequest("PUT", `/api/products/${editingProduct.id}`, formattedData);
      }
      return await apiRequest("POST", "/api/products", formattedData);
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

  const shippingRateForm = useForm({
    resolver: zodResolver(insertShippingRateSchema),
    defaultValues: {
      region: "",
      governorates: "",
      rate: "0",
    },
  });

  const shippingRateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/shipping-rates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-rates"] });
      shippingRateForm.reset();
      toast({ title: "تم إضافة سعر الشحن بنجاح" });
    },
  });

  const deleteShippingRateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/shipping-rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-rates"] });
      toast({ title: "تم حذف سعر الشحن بنجاح" });
    },
  });

  const onEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      additionalImages: (product as any).additionalImages || [],
      stock: product.stock,
      isFeatured: product.isFeatured || false,
    });
    setIsProductDialogOpen(true);
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const categoryName = prompt("أدخل اسم التصنيف الرئيسي لهذا الملف (مثال: بذور):", "بذور");
        if (!categoryName) {
          setImporting(false);
          return;
        }

        const res = await apiRequest("POST", "/api/admin/import-csv", {
          categoryName,
          csvData: text
        });
        const result = await res.json();
        toast({ title: "تم الاستيراد بنجاح", description: result.message });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      } catch (error: any) {
        toast({ title: "فشل الاستيراد", description: error.message, variant: "destructive" });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
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
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCsvImport}
            />
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              استيراد من CSV
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Globe className="h-4 w-4" /> إعدادات الموقع
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إدارة محتوى الموقع</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                  {siteSettings?.map((setting) => (
                    <div key={setting.key} className="space-y-2 border-b pb-4">
                      <label className="text-sm font-bold block">
                        {setting.description || setting.key}
                      </label>
                      <div className="flex gap-2">
                        {setting.key.includes("content") ? (
                          <Textarea 
                            defaultValue={setting.value}
                            onBlur={(e) => {
                              if (e.target.value !== setting.value) {
                                updateSiteSettingMutation.mutate({ key: setting.key, value: e.target.value });
                              }
                            }}
                            className="flex-1 text-right"
                          />
                        ) : (
                          <Input 
                            defaultValue={setting.value}
                            onBlur={(e) => {
                              if (e.target.value !== setting.value) {
                                updateSiteSettingMutation.mutate({ key: setting.key, value: e.target.value });
                              }
                            }}
                            className="flex-1 text-right"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Truck className="h-4 w-4" /> أسعار الشحن
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إدارة أسعار الشحن</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <Form {...shippingRateForm}>
                    <form onSubmit={shippingRateForm.handleSubmit((data) => shippingRateMutation.mutate(data))} className="grid grid-cols-3 gap-2">
                      <FormField
                        control={shippingRateForm.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl><Input placeholder="المنطقة" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={shippingRateForm.control}
                        name="governorates"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl><Input placeholder="المحافظات" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-1">
                        <FormField
                          control={shippingRateForm.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input type="number" placeholder="السعر" {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </form>
                  </Form>

                  <div className="border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-right">المنطقة</th>
                          <th className="p-2 text-right">المحافظات</th>
                          <th className="p-2 text-right">السعر</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {shippingRates?.map((rate) => (
                          <tr key={rate.id} className="border-t">
                            <td className="p-2">{rate.region}</td>
                            <td className="p-2">{rate.governorates}</td>
                            <td className="p-2">{rate.rate} د.أ</td>
                            <td className="p-2 text-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteShippingRateMutation.mutate(rate.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isNurseryDialogOpen} onOpenChange={setIsNurseryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة للمشتل
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة نبتة جديدة للمشتل</DialogTitle>
                </DialogHeader>
                <Form {...nurseryForm}>
                  <form onSubmit={nurseryForm.handleSubmit((data) => nurseryMutation.mutate(data))} className="space-y-4 text-right">
                    <FormField
                      control={nurseryForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم النبتة</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nurseryForm.control}
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
                      control={nurseryForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>النوع</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="plant">نبتة</SelectItem>
                              <SelectItem value="branch">فرع</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nurseryForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الصورة الرئيسية</FormLabel>
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
                                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                                    if (res.ok) {
                                      const data = await res.json();
                                      field.onChange(data.url);
                                    }
                                  }
                                }}
                              />
                              {field.value && <img src={field.value} className="w-20 h-20 object-cover rounded" />}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nurseryForm.control}
                      name="additionalImages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>صور إضافية</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files || []);
                                  const urls = [...(field.value || [])];
                                  for (const file of files) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                                    if (res.ok) {
                                      const data = await res.json();
                                      urls.push(data.url);
                                    }
                                  }
                                  field.onChange(urls);
                                }}
                              />
                              <div className="flex flex-wrap gap-2">
                                {field.value?.map((url, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={url} className="w-16 h-16 object-cover rounded" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newUrls = [...field.value];
                                        newUrls.splice(idx, 1);
                                        field.onChange(newUrls);
                                      }}
                                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={nurseryMutation.isPending}>
                      {nurseryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة نبتة"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Dialog>
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

            <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة تصنيف فرعي
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة تصنيف فرعي جديد</DialogTitle>
                </DialogHeader>
                <Form {...subCategoryForm}>
                  <form onSubmit={subCategoryForm.handleSubmit((data) => subCategoryMutation.mutate(data))} className="space-y-4 text-right">
                    <FormField
                      control={subCategoryForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>التصنيف الرئيسي</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر التصنيف الرئيسي" />
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
                      control={subCategoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم التصنيف الفرعي</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={subCategoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl><Textarea {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={subCategoryMutation.isPending}>
                      {subCategoryMutation.isPending ? <Loader2 className="animate-spin" /> : "حفظ التصنيف الفرعي"}
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>التصنيف</FormLabel>
                            <Select onValueChange={(val) => {
                              field.onChange(val);
                              setSelectedCategoryIdForSub(val);
                            }} defaultValue={field.value}>
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
                        name="subCategoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>التصنيف الفرعي</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر تصنيفاً فرعياً (اختياري)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">بدون تصنيف فرعي</SelectItem>
                                {subCategories?.filter(s => s.categoryId === productForm.getValues("categoryId")).map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={productForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رابط الصورة الأساسية</FormLabel>
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

                    <FormField
                      control={productForm.control}
                      name="additionalImages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>صور إضافية للمعرض</FormLabel>
                          <FormControl>
                            <div className="space-y-4 text-right">
                              <Input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    const newUrls = [...(field.value || [])];
                                    for (let i = 0; i < files.length; i++) {
                                      const formData = new FormData();
                                      formData.append("file", files[i]);
                                      try {
                                        const res = await fetch("/api/upload", {
                                          method: "POST",
                                          body: formData,
                                        });
                                        if (res.ok) {
                                          const data = await res.json();
                                          newUrls.push(data.url);
                                        }
                                      } catch (error) {
                                        console.error("Upload error", error);
                                      }
                                    }
                                    field.onChange(newUrls);
                                    toast({ title: `تم رفع ${files.length} صور بنجاح` });
                                  }
                                }}
                              />
                              <div className="grid grid-cols-4 gap-2">
                                {(field.value || []).map((url: string, index: number) => (
                                  <div key={index} className="relative aspect-square border rounded overflow-hidden group">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newUrls = [...field.value];
                                        newUrls.splice(index, 1);
                                        field.onChange(newUrls);
                                      }}
                                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="discountPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر الخصم (اختياري)</FormLabel>
                          <FormControl><Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value || null)} /></FormControl>
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
                        <td className="p-4 font-mono">{product.price} د.أ</td>
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
                            <p className="font-medium text-sm">{(Number(item.priceAtTime) * item.quantity).toFixed(2)} د.أ</p>
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
                           <p className="text-lg font-bold text-primary">{order.totalAmount} د.أ</p>
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
