import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { insertSheepSchema, insertOrderSchema, insertUserProfileSchema, type Image, type Sheep, type Order } from "../shared/schema";

// تهيئة Firebase Admin
if (getApps().length === 0) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing');
    }
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    // Fix private key formatting for Vercel
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase init error:', error);
    throw error; // Re-throw to see the error in Vercel logs
  }
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const path = req.url?.replace('/api', '') || '/';
    const method = req.method || 'GET';

    // ==================== Images Routes ====================
    if (path === '/images' && method === 'POST') {
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

      return res.json({ 
        id: imageDoc.id,
        imageUrl: imgbbData.data.url,
        thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
      });
    }

    if (path.startsWith('/images/') && method === 'GET') {
      const id = path.split('/')[2];
      const imageDoc = await db.collection('images').doc(id).get();

      if (!imageDoc.exists) {
        return res.status(404).json({ message: "الصورة غير موجودة" });
      }

      const image = { id: imageDoc.id, ...imageDoc.data() } as Image;
      return res.json({
        id: image.id,
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl || image.imageUrl,
        mimeType: image.mimeType,
        originalFileName: image.originalFileName,
        fileSize: image.fileSize,
        createdAt: image.createdAt,
      });
    }

    // ==================== Admins Routes ====================
    if (path === '/admins/check' && method === 'GET') {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      }

      const adminsSnapshot = await db.collection('admins')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (adminsSnapshot.empty) {
        return res.status(404).json({ message: "المستخدم ليس مشرفاً" });
      }

      const adminData = adminsSnapshot.docs[0].data();
      return res.json({
        email: email,
        role: adminData.role || 'secondary',
      });
    }

    if (path === '/admins' && method === 'GET') {
      const adminsSnapshot = await db.collection('admins').get();
      const admins = adminsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.json(admins);
    }

    if (path === '/admins' && method === 'POST') {
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
      return res.json({ id: newAdmin.id, ...newAdmin.data() });
    }

    if (path.startsWith('/admins/') && method === 'DELETE') {
      const id = path.split('/')[2];
      await db.collection('admins').doc(id).delete();
      return res.json({ message: "تم حذف المشرف بنجاح" });
    }

    // ==================== Users Routes ====================
    if (path.startsWith('/users/') && method === 'GET') {
      const uid = path.split('/')[2];
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const userData = userDoc.data();
      return res.json({ ...userData, uid: userDoc.id });
    }

    if (path === '/users' && method === 'POST') {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const existingUser = await db.collection('users').doc(validatedData.uid).get();
      
      if (existingUser.exists) {
        return res.status(400).json({ message: "المستخدم موجود مسبقاً" });
      }

      let finalUserType = validatedData.userType;
      if (validatedData.email) {
        const adminsSnapshot = await db.collection('admins')
          .where('email', '==', validatedData.email)
          .get();
        
        if (!adminsSnapshot.empty) {
          finalUserType = 'admin';
        }
      }

      const userData = {
        ...validatedData,
        userType: finalUserType,
        createdAt: new Date(),
      };

      await db.collection('users').doc(validatedData.uid).set(userData);
      return res.json(userData);
    }

    if (path.startsWith('/users/') && method === 'PATCH') {
      const uid = path.split('/')[2];
      const { userType } = req.body;

      if (!userType || !["buyer", "seller", "admin"].includes(userType)) {
        return res.status(400).json({ message: "نوع المستخدم غير صالح" });
      }

      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      await db.collection('users').doc(uid).update({ userType });
      const updatedUser = await db.collection('users').doc(uid).get();
      return res.json({ ...updatedUser.data(), uid: updatedUser.id });
    }

    // ==================== Sheep Routes ====================
    if (path === '/sheep' && method === 'GET') {
      const sheepSnapshot = await db.collection('sheep').get();
      const allSheep = await Promise.all(sheepSnapshot.docs.map(async (doc: any) => {
        const sheepData = doc.data() as Sheep;
        const imageUrls: string[] = [];
        
        if (sheepData.imageIds && sheepData.imageIds.length > 0) {
          for (const imageId of sheepData.imageIds) {
            try {
              const imageDoc = await db.collection('images').doc(imageId).get();
              if (imageDoc.exists) {
                const imageData = imageDoc.data() as Image;
                imageUrls.push(imageData.imageUrl);
              }
            } catch (err) {
              console.error(`Error fetching image ${imageId}:`, err);
            }
          }
        }
        
        return {
          ...sheepData,
          id: doc.id,
          images: imageUrls,
        };
      }));

      return res.json(allSheep);
    }

    if (path.startsWith('/sheep/') && method === 'GET') {
      const id = path.split('/')[2];
      const sheepDoc = await db.collection('sheep').doc(id).get();

      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "الخروف غير موجود" });
      }

      const sheepData = sheepDoc.data() as Sheep;
      const imageUrls: string[] = [];
      
      if (sheepData.imageIds && sheepData.imageIds.length > 0) {
        for (const imageId of sheepData.imageIds) {
          try {
            const imageDoc = await db.collection('images').doc(imageId).get();
            if (imageDoc.exists) {
              const imageData = imageDoc.data() as Image;
              imageUrls.push(imageData.imageUrl);
            }
          } catch (err) {
            console.error(`Error fetching image ${imageId}:`, err);
          }
        }
      }
      
      return res.json({
        ...sheepData,
        id: sheepDoc.id,
        images: imageUrls,
      });
    }

    if (path === '/sheep' && method === 'POST') {
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
      return res.json({ id: newSheep.id, ...newSheep.data() });
    }

    if (path.startsWith('/sheep/') && method === 'PATCH') {
      const id = path.split('/')[2];
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
      return res.json({ id: updatedSheep.id, ...updatedSheep.data() });
    }

    if (path.startsWith('/sheep/') && method === 'DELETE') {
      const id = path.split('/')[2];
      await db.collection('sheep').doc(id).delete();
      return res.json({ message: "تم حذف الخروف بنجاح" });
    }

    // ==================== Orders Routes ====================
    if (path === '/orders' && method === 'GET') {
      const ordersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
      const orders = ordersSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      });
      return res.json(orders);
    }

    if (path.startsWith('/orders/') && method === 'GET') {
      const id = path.split('/')[2];
      const orderDoc = await db.collection('orders').doc(id).get();

      if (!orderDoc.exists) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      const order = { id: orderDoc.id, ...orderDoc.data() };
      return res.json(order);
    }

    if (path === '/orders' && method === 'POST') {
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
      return res.json({ id: newOrder.id, ...newOrder.data() });
    }

    if (path.startsWith('/orders/') && method === 'PATCH') {
      const id = path.split('/')[2];
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
      return res.json({ id: updatedOrder.id, ...updatedOrder.data() });
    }

    if (path.startsWith('/orders/') && method === 'DELETE') {
      const id = path.split('/')[2];
      await db.collection('orders').doc(id).delete();
      return res.json({ message: "تم حذف الطلب بنجاح" });
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (error: any) {
    console.error('API Error:', error);
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(status).json({ message });
  }
}