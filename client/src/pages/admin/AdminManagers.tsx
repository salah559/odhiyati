import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { Admin } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { getAllAdmins, removeAdmin as removeAdminFromFirestore } from "@/lib/firestore";
import { collection, addDoc, query as firestoreQuery, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PRIMARY_ADMIN_EMAIL = "bouazzasalah120120@gmail.com";

export default function AdminManagers() {
  const { toast } = useToast();
  const { isPrimaryAdmin } = useAuth();
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ["admins"],
    queryFn: getAllAdmins,
  });

  const addMutation = useMutation({
    mutationFn: async (email: string) => {
      if (email === PRIMARY_ADMIN_EMAIL) {
        throw new Error("هذا البريد محجوز للمدير الرئيسي");
      }

      // Check if admin already exists
      const adminsRef = collection(db, "admins");
      const q = firestoreQuery(adminsRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        throw new Error("هذا المدير موجود بالفعل");
      }

      const adminData = {
        email,
        role: "secondary" as const,
        addedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "admins"), adminData);
      return adminData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة المدير الجديد",
      });
      setNewAdminEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إضافة المدير",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (id === "primary") {
        throw new Error("لا يمكن حذف المدير الرئيسي");
      }
      await removeAdminFromFirestore(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المدير",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل حذف المدير",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (!newAdminEmail) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }
    addMutation.mutate(newAdminEmail);
  };

  if (!isPrimaryAdmin) {
    return (
      <Card className="p-16 text-center">
        <p className="text-muted-foreground">لا تملك صلاحية الوصول إلى هذه الصفحة</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-admins-title">
          إدارة المدراء
        </h1>
        <p className="text-muted-foreground">إضافة وإزالة المدراء</p>
      </div>

      {/* Add Admin Form */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">إضافة مدير جديد</h3>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="البريد الإلكتروني"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            data-testid="input-admin-email"
          />
          <Button
            onClick={handleAdd}
            disabled={addMutation.isPending}
            className="gap-2"
            data-testid="button-add-admin"
          >
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        </div>
      </Card>

      {/* Admins List */}
      {isLoading ? (
        <Card className="p-6">
          <div className="h-48 bg-muted animate-pulse rounded" />
        </Card>
      ) : admins.length === 0 ? (
        <Card className="p-16 text-center">
          <p className="text-muted-foreground">لا يوجد مدراء إضافيون</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">تاريخ الإضافة</TableHead>
                <TableHead className="text-right w-24">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                  <TableCell className="font-medium" data-testid={`text-admin-email-${admin.id}`}>
                    {admin.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={admin.role === "primary" ? "default" : "secondary"}
                      data-testid={`badge-admin-role-${admin.id}`}
                    >
                      {admin.role === "primary" ? "مدير رئيسي" : "مدير ثانوي"}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-admin-date-${admin.id}`}>
                    {format(new Date(admin.addedAt), "PPP", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    {admin.role !== "primary" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(admin.id)}
                        data-testid={`button-delete-admin-${admin.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المدير؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
