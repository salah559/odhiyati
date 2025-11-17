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
      const { imageData, mimeType, originalFileName } = req.body;

      if (!imageData || !mimeType) {
        return res.status(400).json({ message: "بيانات الصورة مطلوبة" });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        return res.status(400).json({ message: "نوع الصورة غير مدعوم" });
      }

      if (typeof imageData !== 'string' || imageData.length === 0) {
        return res.status(400).json({ message: "بيانات الصورة غير صالحة" });
      }

      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

      const formData = new URLSearchParams();
      formData.append('key', process.env.IMGBB_API_KEY || '');
      formData.append('image', base64Data);
      if (originalFileName) {
        formData.append('name', originalFileName);
      }

      const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!imgbbResponse.ok) {
        const errorData = await imgbbResponse.json();
        throw new Error(errorData.error?.message || 'فشل في رفع الصورة إلى ImgBB');
      }

      const imgbbData = await imgbbResponse.json();

      if (!imgbbData.success || !imgbbData.data) {
        throw new Error('فشل في رفع الصورة إلى ImgBB');
      }

      const result = await db.insert(images).values({
        imageUrl: imgbbData.data.url,
        thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
        deleteUrl: imgbbData.data.delete_url,
        originalFileName: originalFileName || imgbbData.data.title || null,
        mimeType,
        fileSize: imgbbData.data.size || null,
      });

      const insertId = result[0].insertId;

      if (!insertId) {
        throw new Error("فشل في الحصول على معرف الصورة");
      }

      res.json({ 
        id: insertId,
        imageUrl: imgbbData.data.url,
        thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
      });
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

      res.json({
        id: image.id,
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl || image.imageUrl,
        mimeType: image.mimeType,
        originalFileName: image.originalFileName,
        fileSize: image.fileSize,
        createdAt: image.createdAt,
      });
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
      const adminId = parseInt(id);

      const [admin] = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);

      if (!admin) {
        return res.status(404).json({ message: "المدير غير موجود" });
      }

      if (admin.role === "primary") {
        return res.status(400).json({ message: "لا يمكن حذف المدير الرئيسي" });
      }

      await db.delete(admins).where(eq(admins.id, adminId));
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

  app.get("/api/sheep", async (_req, res) => {
    try {
      const allSheep = await db.select().from(sheep);

      // For each sheep, convert image IDs to URLs
      const sheepWithImages = await Promise.all(
        allSheep.map(async (s) => {
          let imageUrls: string[] = [];

          if (s.images) {
            try {
              // Parse the images field (it could be JSON string or array)
              const imageIds = typeof s.images === 'string' 
                ? JSON.parse(s.images) 
                : s.images;

              if (Array.isArray(imageIds) && imageIds.length > 0) {
                // Check if first element is a number (ID) or URL
                if (typeof imageIds[0] === 'number') {
                  // Fetch image URLs from images table
                  const imageRecords = await db
                    .select()
                    .from(images)
                    .where(inArray(images.id, imageIds));

                  imageUrls = imageRecords.map(img => img.imageUrl);
                } else {
                  // Already URLs
                  imageUrls = imageIds;
                }
              }
            } catch (e) {
              console.error('Error parsing images for sheep:', s.id, e);
              imageUrls = [];
            }
          }

          return {
            ...s,
            images: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400']
          };
        })
      );

      res.json(sheepWithImages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sheep/:id", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(sheep)
        .where(eq(sheep.id, parseInt(req.params.id)))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ error: "Sheep not found" });
      }

      const s = result[0];
      let imageUrls: string[] = [];

      if (s.images) {
        try {
          // Parse the images field (it could be JSON string or array)
          const imageIds = typeof s.images === 'string' 
            ? JSON.parse(s.images) 
            : s.images;

          if (Array.isArray(imageIds) && imageIds.length > 0) {
            // Check if first element is a number (ID) or URL
            if (typeof imageIds[0] === 'number') {
              // Fetch image URLs from images table
              const imageRecords = await db
                .select()
                .from(images)
                .where(inArray(images.id, imageIds));

              imageUrls = imageRecords.map(img => img.imageUrl);
            } else {
              // Already URLs
              imageUrls = imageIds;
            }
          }
        } catch (e) {
          console.error('Error parsing images for sheep:', s.id, e);
          imageUrls = [];
        }
      }

      res.json({
        ...s,
        images: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400']
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

      let imageUrls: string[] = [];
      if (newSheep.imageIds && Array.isArray(newSheep.imageIds) && newSheep.imageIds.length > 0) {
        const validIds = newSheep.imageIds.filter(id => typeof id === 'number' && id > 0);

        if (validIds.length > 0) {
          const imageRecords = await db.select().from(images).where(inArray(images.id, validIds));
          imageUrls = imageRecords.map(img => img.imageUrl);
        }
      }

      const sheepWithImages = {
        ...newSheep,
        images: imageUrls,
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

      let imageUrls: string[] = [];
      if (updatedSheep.imageIds && Array.isArray(updatedSheep.imageIds) && updatedSheep.imageIds.length > 0) {
        const validIds = updatedSheep.imageIds.filter(id => typeof id === 'number' && id > 0);

        if (validIds.length > 0) {
          const imageRecords = await db.select().from(images).where(inArray(images.id, validIds));
          imageUrls = imageRecords.map(img => img.imageUrl);
        }
      }

      const sheepWithImages = {
        ...updatedSheep,
        images: imageUrls,
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