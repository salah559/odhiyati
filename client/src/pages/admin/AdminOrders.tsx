import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, OrderStatus } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  processing: "default",
  completed: "outline",
  cancelled: "destructive",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function AdminOrders() {
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الطلب",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-orders-title">
          إدارة الطلبات
        </h1>
        <p className="text-muted-foreground">عرض وإدارة جميع الطلبات</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-16 text-center">
          <p className="text-muted-foreground">لا توجد طلبات بعد</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6" data-testid={`card-order-${order.id}`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Order Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1" data-testid={`text-customer-${order.id}`}>
                        {order.userName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                      <p className="text-sm text-muted-foreground">{order.userPhone}</p>
                    </div>
                    <Badge variant={statusColors[order.status]} data-testid={`badge-status-${order.id}`}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">المنتجات:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <img
                          src={item.sheepImage}
                          alt={item.sheepName}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.sheepName}</p>
                          <p className="text-muted-foreground">
                            {item.price.toLocaleString('ar-DZ')} دج × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">العنوان:</span> {order.shippingAddress}
                    </p>
                    {order.notes && (
                      <p>
                        <span className="text-muted-foreground">ملاحظات:</span> {order.notes}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {format(new Date(order.createdAt), "PPP", { locale: ar })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between gap-4 md:w-64">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">المبلغ الإجمالي</p>
                    <p className="text-2xl font-bold text-primary" data-testid={`text-total-${order.id}`}>
                      {order.totalAmount.toLocaleString('ar-DZ')} دج
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">تغيير الحالة</label>
                    <Select
                      value={order.status}
                      onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger data-testid={`select-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([status, label]) => (
                          <SelectItem key={status} value={status}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
