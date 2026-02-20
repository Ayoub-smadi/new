import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();

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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {user?.firstName?.[0]}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">أهلاً، {user?.firstName} {user?.lastName}</h1>
          <p className="text-muted-foreground">هنا يمكنك متابعة طلباتك السابقة والحالية</p>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" /> طلباتي
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground mb-4">لا توجد طلبات سابقة</p>
            <Button variant="outline" onClick={() => window.location.href = "/products"}>ابدأ التسوق</Button>
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
                    <div className="md:w-64 space-y-2 border-t md:border-t-0 md:border-r md:pr-6 pt-4 md:pt-0">
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
      </div>
    </div>
  );
}
