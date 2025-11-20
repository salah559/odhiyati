import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getDb } from "./firestore";
import { insertSheepSchema, insertOrderSchema, insertImageSchema, type Image, type Sheep, type Order } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  const db = getDb();

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

  // ==================== Images Routes ====================
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

      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'مفتاح IMGBB_API_KEY غير موجود في متغيرات البيئة' });
      }

      const formData = new URLSearchParams();
      formData.append('key', apiKey);
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

      const imageDoc = await db.collection('images').add({
        imageUrl: imgbbData.data.url,
        thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
        deleteUrl: imgbbData.data.delete_url,
        originalFileName: originalFileName || imgbbData.data.title || null,
        mimeType,
        fileSize: imgbbData.data.size || null,
        createdAt: new Date(),
      });

      res.json({ 
        id: imageDoc.id,
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
      const imageDoc = await db.collection('images').doc(id).get();

      if (!imageDoc.exists) {
        return res.status(404).json({ message: "الصورة غير موجودة" });
      }

      const image = { id: imageDoc.id, ...imageDoc.data() } as Image;

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

  // ==================== Admins Routes ====================
  app.get("/api/admins/check", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      }

      const adminsSnapshot = await db.collection('admins')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (adminsSnapshot.empty) {
        return res.json({ isAdmin: false });
      }

      const adminData = adminsSnapshot.docs[0].data();

      res.json({
        isAdmin: true,
        role: (adminData as any).role || 'secondary',
      });
    } catch (error: any) {
      console.error("Error checking admin:", error);
      res.status(500).json({ message: error.message || "فشل في التحقق من الصلاحيات" });
    }
  });

  app.get("/api/admins", async (req, res) => {
    try {
      const adminsSnapshot = await db.collection('admins').get();
      const admins = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json(admins);
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: error.message || "فشل في جلب المشرفين" });
    }
  });

  app.post("/api/admins", async (req, res) => {
    try {
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      }

      const existingSnapshot = await db.collection('admins')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        return res.status(400).json({ message: "المشرف موجود مسبقاً" });
      }

      const adminDoc = await db.collection('admins').add({
        email,
        role: role || 'secondary',
        addedAt: new Date(),
      });

      const newAdmin = await db.collection('admins').doc(adminDoc.id).get();
      res.json({ id: newAdmin.id, ...newAdmin.data() });
    } catch (error: any) {
      console.error("Error adding admin:", error);
      res.status(500).json({ message: error.message || "فشل في إضافة المشرف" });
    }
  });

  app.delete("/api/admins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection('admins').doc(id).delete();
      res.json({ message: "تم حذف المشرف بنجاح" });
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      res.status(500).json({ message: error.message || "فشل في حذف المشرف" });
    }
  });

  // ==================== Sheep Routes ====================
  app.get("/api/sheep", async (req, res) => {
    try {
      const sheepSnapshot = await db.collection('sheep').get();
      const allSheep = sheepSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Sheep[];

      res.json(allSheep);
    } catch (error: any) {
      console.error("Error fetching sheep:", error);
      res.status(500).json({ message: error.message || "فشل في جلب الأغنام" });
    }
  });

  app.get("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sheepDoc = await db.collection('sheep').doc(id).get();

      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "الخروف غير موجود" });
      }

      const sheep = { id: sheepDoc.id, ...sheepDoc.data() } as Sheep;
      res.json(sheep);
    } catch (error: any) {
      console.error("Error fetching sheep:", error);
      res.status(500).json({ message: error.message || "فشل في جلب الخروف" });
    }
  });

  app.post("/api/sheep", async (req, res) => {
    try {
      const validation = insertSheepSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0].message 
        });
      }

      const data = validation.data;
      const sheepDoc = await db.collection('sheep').add({
        ...data,
        isFeatured: data.isFeatured || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newSheep = await db.collection('sheep').doc(sheepDoc.id).get();
      res.json({ id: newSheep.id, ...newSheep.data() });
    } catch (error: any) {
      console.error("Error creating sheep:", error);
      res.status(500).json({ message: error.message || "فشل في إضافة الخروف" });
    }
  });

  app.patch("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sheepDoc = await db.collection('sheep').doc(id).get();

      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "الخروف غير موجود" });
      }

      const validation = insertSheepSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0].message 
        });
      }

      const data = validation.data;
      await db.collection('sheep').doc(id).update({
        ...data,
        updatedAt: new Date(),
      });

      const updatedSheep = await db.collection('sheep').doc(id).get();
      res.json({ id: updatedSheep.id, ...updatedSheep.data() });
    } catch (error: any) {
      console.error("Error updating sheep:", error);
      res.status(500).json({ message: error.message || "فشل في تحديث الخروف" });
    }
  });

  app.delete("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection('sheep').doc(id).delete();
      res.json({ message: "تم حذف الخروف بنجاح" });
    } catch (error: any) {
      console.error("Error deleting sheep:", error);
      res.status(500).json({ message: error.message || "فشل في حذف الخروف" });
    }
  });

  // ==================== Orders Routes ====================
  app.get("/api/orders", async (_req, res) => {
    try {
      const ordersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      });
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: error.message || "فشل في جلب الطلبات" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const orderDoc = await db.collection('orders').doc(id).get();

      if (!orderDoc.exists) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
      res.json(order);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: error.message || "فشل في جلب الطلب" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0].message 
        });
      }

      const data = validation.data;
      const orderDoc = await db.collection('orders').add({
        ...data,
        status: data.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newOrder = await db.collection('orders').doc(orderDoc.id).get();
      res.json({ id: newOrder.id, ...newOrder.data() });
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: error.message || "فشل في إنشاء الطلب" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "الحالة مطلوبة" });
      }

      const orderDoc = await db.collection('orders').doc(id).get();
      if (!orderDoc.exists) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      await db.collection('orders').doc(id).update({
        status,
        updatedAt: new Date(),
      });

      const updatedOrder = await db.collection('orders').doc(id).get();
      res.json({ id: updatedOrder.id, ...updatedOrder.data() });
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: error.message || "فشل في تحديث الطلب" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection('orders').doc(id).delete();
      res.json({ message: "تم حذف الطلب بنجاح" });
    } catch (error: any) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: error.message || "فشل في حذف الطلب" });
    }
  });

  return createServer(app);
}