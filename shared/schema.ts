import { z } from "zod";

// Sheep Categories
export const sheepCategories = ["محلي", "روماني", "إسباني"] as const;
export type SheepCategory = typeof sheepCategories[number];

// Image Types
export interface Image {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  deleteUrl?: string;
  originalFileName?: string;
  mimeType: string;
  fileSize?: number;
  createdAt: Date;
}

export const insertImageSchema = z.object({
  imageUrl: z.string().url("رابط الصورة يجب أن يكون صالحاً"),
  thumbnailUrl: z.string().url().optional(),
  deleteUrl: z.string().url().optional(),
  originalFileName: z.string().optional(),
  mimeType: z.string(),
  fileSize: z.number().optional(),
});

export type InsertImage = z.infer<typeof insertImageSchema>;

// Sheep Types
export interface Sheep {
  id: string;
  name: string;
  category: SheepCategory;
  price: number;
  discountPercentage?: number;
  imageIds: string[];
  images?: string[];
  age: string;
  weight: string;
  breed: string;
  healthStatus: string;
  description: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const insertSheepSchema = z.object({
  name: z.string().min(1, "اسم الخروف مطلوب"),
  category: z.enum(sheepCategories),
  price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  discountPercentage: z.number().min(0).max(100, "النسبة يجب أن تكون بين 0 و 100").optional(),
  imageIds: z.array(z.string()).min(1, "يجب إضافة صورة واحدة على الأقل"),
  age: z.string().min(1, "العمر مطلوب"),
  weight: z.string().min(1, "الوزن مطلوب"),
  breed: z.string().min(1, "السلالة مطلوبة"),
  healthStatus: z.string().min(1, "الحالة الصحية مطلوبة"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  isFeatured: z.boolean().default(false),
});

export type InsertSheep = z.infer<typeof insertSheepSchema>;

// Order Types
export const orderStatuses = ["pending", "processing", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

export interface Order {
  id: string;
  userId?: string;
  userName: string;
  userPhone: string;
  wilayaCode: string;
  wilayaName: string;
  communeId: number;
  communeName: string;
  items: {
    sheepId: string;
    sheepName: string;
    sheepImageId: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: string;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
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
    sheepImageId: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "المبلغ غير صالح"),
  notes: z.string().optional(),
  status: z.enum(orderStatuses).default("pending"),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

// User Types
export const userTypes = ["buyer", "seller", "admin"] as const;
export type UserType = typeof userTypes[number];

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType?: UserType;
  isAdmin?: boolean;
  adminRole?: "primary" | "secondary";
  createdAt?: Date;
}

export const insertUserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email("البريد الإلكتروني غير صالح").nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().optional(),
  userType: z.enum(userTypes),
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// Admin Types
export interface Admin {
  id: string;
  email: string;
  role: "primary" | "secondary";
  addedAt: Date;
}

export const insertAdminSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  role: z.enum(["primary", "secondary"]).default("secondary"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
