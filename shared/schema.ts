import { z } from "zod";
import { mysqlTable, varchar, decimal, json, boolean, timestamp, text, int, mediumtext, serial } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const sheepCategories = ["محلي", "روماني", "إسباني"] as const;
export type SheepCategory = typeof sheepCategories[number];

export const images = mysqlTable("images", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  deleteUrl: text("delete_url"),
  originalFileName: varchar("original_file_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: int("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export const insertImageSchema = createInsertSchema(images, {
  imageUrl: z.string().url("رابط الصورة يجب أن يكون صالحاً"),
  thumbnailUrl: z.string().url().optional(),
  deleteUrl: z.string().url().optional(),
  originalFileName: z.string().optional(),
  mimeType: z.string(),
  fileSize: z.number().optional(),
}).omit({ id: true, createdAt: true });
export type InsertImage = z.infer<typeof insertImageSchema>;

export const sheep = mysqlTable("sheep", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  imageIds: json("image_ids").$type<number[]>().notNull(),
  age: varchar("age", { length: 100 }).notNull(),
  weight: varchar("weight", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 100 }).notNull(),
  healthStatus: text("health_status").notNull(),
  description: text("description").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Sheep = typeof sheep.$inferSelect;
export const insertSheepSchema = createInsertSchema(sheep, {
  name: z.string().min(1, "اسم الخروف مطلوب"),
  category: z.enum(sheepCategories),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "السعر يجب أن يكون موجباً"),
  discountPercentage: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), "النسبة يجب أن تكون بين 0 و 100"),
  imageIds: z.array(z.number()).min(1, "يجب إضافة صورة واحدة على الأقل"),
  age: z.string().min(1, "العمر مطلوب"),
  weight: z.string().min(1, "الوزن مطلوب"),
  breed: z.string().min(1, "السلالة مطلوبة"),
  healthStatus: z.string().min(1, "الحالة الصحية مطلوبة"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  isFeatured: z.boolean().default(false),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertSheep = z.infer<typeof insertSheepSchema>;

export const orderStatuses = ["pending", "processing", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 128 }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  userPhone: varchar("user_phone", { length: 20 }).notNull(),
  wilayaCode: varchar("wilaya_code", { length: 10 }).notNull(),
  wilayaName: varchar("wilaya_name", { length: 100 }).notNull(),
  communeId: int("commune_id").notNull(),
  communeName: varchar("commune_name", { length: 100 }).notNull(),
  items: json("items").$type<{
    sheepId: number;
    sheepName: string;
    sheepImageId: number;
    price: number;
    quantity: number;
  }[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export const insertOrderSchema = createInsertSchema(orders, {
  userId: z.string().optional(),
  userName: z.string().min(1, "الاسم مطلوب"),
  userPhone: z.string().min(10, "رقم الهاتف غير صالح"),
  wilayaCode: z.string().min(1, "الولاية مطلوبة"),
  wilayaName: z.string().min(1, "الولاية مطلوبة"),
  communeId: z.number().min(1, "البلدية مطلوبة"),
  communeName: z.string().min(1, "البلدية مطلوبة"),
  items: z.array(z.object({
    sheepId: z.number(),
    sheepName: z.string(),
    sheepImageId: z.number(),
    price: z.number(),
    quantity: z.number().min(1),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
  totalAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "المبلغ غير صالح"),
  notes: z.string().optional(),
  status: z.enum(orderStatuses).default("pending"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const admins = mysqlTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 20 }).notNull().default("secondary"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export const insertAdminSchema = createInsertSchema(admins, {
  email: z.string().email("البريد الإلكتروني غير صالح"),
  role: z.enum(["primary", "secondary"]).default("secondary"),
}).omit({ id: true, addedAt: true });

export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  adminRole?: "primary" | "secondary";
}

export const discounts = mysqlTable("discounts", {
  id: serial("id").primaryKey(),
  sheepId: int("sheep_id").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;
export const insertDiscountSchema = createInsertSchema(discounts, {
  sheepId: z.number().min(1, "يجب اختيار منتج"),
  percentage: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 1 && num <= 100;
  }, "النسبة يجب أن تكون بين 1% و 100%"),
  validFrom: z.string(),
  validTo: z.string(),
  isActive: z.boolean().default(true),
}).omit({ id: true, createdAt: true });

export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
