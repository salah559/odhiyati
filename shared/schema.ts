import { z } from "zod";

// Sheep/Product Schema
export const sheepCategories = ["كبش", "نعجة", "خروف"] as const;
export type SheepCategory = typeof sheepCategories[number];

export interface Sheep {
  id: string;
  name: string;
  category: SheepCategory;
  price: number;
  discountPercentage?: number;
  images: string[]; // Array of image URLs
  age: string; // e.g., "سنتان"
  weight: string; // e.g., "45 كجم"
  breed: string; // e.g., "نعيمي"
  healthStatus: string;
  description: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const insertSheepSchema = z.object({
  name: z.string().min(1, "اسم الخروف مطلوب"),
  category: z.enum(sheepCategories),
  price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  discountPercentage: z.number().min(0).max(100).optional(),
  images: z.array(z.string()).min(1, "يجب إضافة صورة واحدة على الأقل"),
  age: z.string().min(1, "العمر مطلوب"),
  weight: z.string().min(1, "الوزن مطلوب"),
  breed: z.string().min(1, "السلالة مطلوبة"),
  healthStatus: z.string().min(1, "الحالة الصحية مطلوبة"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  isFeatured: z.boolean().default(false),
});

export type InsertSheep = z.infer<typeof insertSheepSchema>;

// Order Schema
export const orderStatuses = ["pending", "processing", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

export interface OrderItem {
  sheepId: string;
  sheepName: string;
  sheepImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string | null;
  userName: string;
  userPhone: string;
  wilayaCode: string;
  wilayaName: string;
  communeId: number;
  communeName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const insertOrderSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().min(1, "الاسم مطلوب"),
  userPhone: z.string().min(10, "رقم الهاتف غير صالح"),
  wilayaCode: z.string().min(1, "الولاية مطلوبة"),
  wilayaName: z.string().min(1, "الولاية مطلوبة"),
  communeId: z.number().min(1, "البلدية مطلوبة"),
  communeName: z.string().min(1, "البلدية مطلوبة"),
  items: z.array(z.object({
    sheepId: z.string(),
    sheepName: z.string(),
    sheepImage: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
  status: z.enum(orderStatuses).default("pending"),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Admin Schema
export interface Admin {
  id: string;
  email: string;
  role: "primary" | "secondary";
  addedAt: string;
}

export const insertAdminSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  role: z.enum(["primary", "secondary"]).default("secondary"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;

// User Schema for Firebase Auth
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  adminRole?: "primary" | "secondary";
}

// Discount Schema
export interface Discount {
  id: string;
  sheepId: string;
  percentage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
}

export const insertDiscountSchema = z.object({
  sheepId: z.string().min(1, "يجب اختيار منتج"),
  percentage: z.number().min(1, "النسبة يجب أن تكون على الأقل 1%").max(100, "النسبة يجب ألا تتجاوز 100%"),
  validFrom: z.string(),
  validTo: z.string(),
  isActive: z.boolean().default(true),
});

export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
