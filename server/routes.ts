import type { Express } from "express";
import { createServer, type Server } from "http";
import { getUserByEmail } from "./admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { db } from "./db";
import { admins, sheep, orders, images, insertSheepSchema, insertOrderSchema, insertImageSchema } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/download-app", (req, res) => {
    try {
      const apkPath = path.join(__dirname, "..", "attached_assets", "app-release_1762910223541.apk");

      if (!fs.existsSync(apkPath)) {
        return res.status(404).json({ message: "APK file not found" });
      }

      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", "attachment; filename=adhiati-app.apk");

      const fileStream = fs.createReadStream(apkPath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("Error downloading APK:", error);
      res.status(500).json({ message: "Error downloading app" });
    }
  });

  app.post("/api/images", async (req, res) => {
    try {
      const { imageData, mimeType } = req.body;

      if (!imageData || !mimeType) {
        return res.status(400).json({ message: "بيانات الصورة مطلوبة" });
      }

      const result = await db.insert(images).values({
        imageData,
        mimeType,
      });

      res.json({ id: result[0].insertId });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: error.message || "فشل في رفع الصورة" });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [image] = await db.select().from(images).where(eq(images.id, parseInt(id))).limit(1);

      if (!image) {
        return res.status(404).json({ message: "الصورة غير موجودة" });
      }

      res.json(image);
    } catch (error: any) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: error.message || "فشل في جلب الصورة" });
    }
  });

  app.get("/api/admins/check", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.json(null);
      }

      const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

      if (!admin) {
        return res.json(null);
      }

      res.json({ email: admin.email, role: admin.role });
    } catch (error: any) {
      console.error("Error checking admin:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.get("/api/admins", async (req, res) => {
    try {
      const allAdmins = await db.select().from(admins);
      res.json(allAdmins);
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.post("/api/admins", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      }

      if (email === "bouazzasalah120120@gmail.com") {
        return res.status(400).json({ message: "هذا البريد محجوز للمدير الرئيسي" });
      }

      const [existing] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
      if (existing) {
        return res.status(400).json({ message: "هذا المدير موجود بالفعل" });
      }

      const userResponse = await fetch(`${req.protocol}://${req.get('host')}/api/admin/user-by-email?email=${encodeURIComponent(email)}`);

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          return res.status(404).json({ message: "المستخدم غير موجود. يجب على المستخدم التسجيل في الموقع أولاً" });
        }
        return res.status(500).json({ message: "فشل في الحصول على معلومات المستخدم" });
      }

      const result = await db.insert(admins).values({
        email,
        role: "secondary"
      });

      res.json({ id: result[0].insertId, email, role: "secondary" });
    } catch (error: any) {
      console.error("Error adding admin:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.delete("/api/admins/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const [admin] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);

      if (!admin) {
        return res.status(404).json({ message: "المدير غير موجود" });
      }

      if (admin.role === "primary") {
        return res.status(400).json({ message: "لا يمكن حذف المدير الرئيسي" });
      }

      await db.delete(admins).where(eq(admins.id, id));
      res.json({ message: "تم الحذف بنجاح" });
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.get("/api/admin/user-by-email", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error getting user by email:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.get("/api/sheep", async (req, res) => {
    try {
      const allSheep = await db.select().from(sheep);

      const sheepWithImages = await Promise.all(allSheep.map(async (s) => {
        let imageRecords = [];
        
        if (s.imageIds && Array.isArray(s.imageIds) && s.imageIds.length > 0) {
          // Filter out any non-numeric values and ensure we have valid IDs
          const validIds = s.imageIds.filter(id => typeof id === 'number' && id > 0);
          
          if (validIds.length > 0) {
            imageRecords = await db.select().from(images).where(inArray(images.id, validIds));
          }
        }

        return {
          ...s,
          images: imageRecords.map(img => ({
            id: img.id,
            url: `data:${img.mimeType};base64,${img.imageData}`,
          })),
        };
      }));

      res.json(sheepWithImages);
    } catch (error: any) {
      console.error("Error fetching sheep:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.get("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [sheepItem] = await db.select().from(sheep).where(eq(sheep.id, parseInt(id))).limit(1);

      if (!sheepItem) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }

      let imageRecords = [];
      
      if (sheepItem.imageIds && Array.isArray(sheepItem.imageIds) && sheepItem.imageIds.length > 0) {
        const validIds = sheepItem.imageIds.filter(id => typeof id === 'number' && id > 0);
        
        if (validIds.length > 0) {
          imageRecords = await db.select().from(images).where(inArray(images.id, validIds));
        }
      }

      const sheepWithImages = {
        ...sheepItem,
        images: imageRecords.map(img => ({
          id: img.id,
          url: `data:${img.mimeType};base64,${img.imageData}`,
        })),
      };

      res.json(sheepWithImages);
    } catch (error: any) {
      console.error("Error fetching sheep:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.post("/api/sheep", async (req, res) => {
    try {
      const validated = insertSheepSchema.parse(req.body);

      // Ensure imageIds is properly formatted as array with valid numbers
      const validImageIds = Array.isArray(validated.imageIds) 
        ? validated.imageIds.filter(id => typeof id === 'number' && id > 0)
        : [];

      const sheepData = {
        ...validated,
        imageIds: validImageIds
      };

      const result = await db.insert(sheep).values(sheepData);

      const [newSheep] = await db.select().from(sheep).where(eq(sheep.id, result[0].insertId)).limit(1);

      let imageRecords = [];
      if (newSheep.imageIds && Array.isArray(newSheep.imageIds) && newSheep.imageIds.length > 0) {
        const validIds = newSheep.imageIds.filter(id => typeof id === 'number' && id > 0);
        
        if (validIds.length > 0) {
          imageRecords = await db.select().from(images).where(inArray(images.id, validIds));
        }
      }

      const sheepWithImages = {
        ...newSheep,
        images: imageRecords.map(img => ({
          id: img.id,
          url: `data:${img.mimeType};base64,${img.imageData}`,
        })),
      };

      res.json(sheepWithImages);
    } catch (error: any) {
      console.error("Error creating sheep:", error);
      res.status(500).json({ message: error.message || "فشل في إضافة المنتج" });
    }
  });

  app.patch("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertSheepSchema.parse(req.body);

      // Ensure imageIds is properly formatted
      const updateData = {
        ...validated,
        imageIds: Array.isArray(validated.imageIds) 
          ? validated.imageIds.filter(id => typeof id === 'number' && id > 0)
          : []
      };

      await db.update(sheep).set(updateData).where(eq(sheep.id, parseInt(id)));

      const [updatedSheep] = await db.select().from(sheep).where(eq(sheep.id, parseInt(id))).limit(1);

      let imageRecords = [];
      if (updatedSheep.imageIds && Array.isArray(updatedSheep.imageIds) && updatedSheep.imageIds.length > 0) {
        const validIds = updatedSheep.imageIds.filter(id => typeof id === 'number' && id > 0);
        
        if (validIds.length > 0) {
          imageRecords = await db.select().from(images).where(inArray(images.id, validIds));
        }
      }

      const sheepWithImages = {
        ...updatedSheep,
        images: imageRecords.map(img => ({
          id: img.id,
          url: `data:${img.mimeType};base64,${img.imageData}`,
        })),
      };

      res.json(sheepWithImages);
    } catch (error: any) {
      console.error("Error updating sheep:", error);
      res.status(500).json({ message: error.message || "فشل في تحديث المنتج" });
    }
  });

  app.delete("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(sheep).where(eq(sheep.id, parseInt(id)));
      res.json({ message: "تم الحذف بنجاح" });
    } catch (error: any) {
      console.error("Error deleting sheep:", error);
      res.status(500).json({ message: error.message || "فشل في حذف المنتج" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await db.select().from(orders);
      res.json(allOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const result = await db.insert(orders).values(validated);

      const [newOrder] = await db.select().from(orders).where(eq(orders.id, result[0].insertId)).limit(1);
      res.json(newOrder);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: error.message || "فشل في إنشاء الطلب" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "الحالة مطلوبة" });
      }

      await db.update(orders).set({ status }).where(eq(orders.id, parseInt(id)));

      const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, parseInt(id))).limit(1);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: error.message || "فشل في تحديث حالة الطلب" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}