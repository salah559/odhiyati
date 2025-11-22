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

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase init error:', error);
    throw error;
  }
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ message: "حجم الصورة كبير جداً (الحد الأقصى 10MB)" });
      }

      const imageDoc = await db.collection('images').add({
        data: base64Data,
        mimeType,
        originalFileName,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ 
        id: imageDoc.id,
        url: `/api/images/${imageDoc.id}`
      });
    }

    if (path.startsWith('/images/') && method === 'GET') {
      const imageId = path.split('/')[2];
      const imageDoc = await db.collection('images').doc(imageId).get();

      if (!imageDoc.exists) {
        return res.status(404).json({ message: "الصورة غير موجودة" });
      }

      const imageData = imageDoc.data();
      if (!imageData) {
        return res.status(404).json({ message: "بيانات الصورة غير موجودة" });
      }

      const buffer = Buffer.from(imageData.data, 'base64');
      res.setHeader('Content-Type', imageData.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    }

    // ==================== Sheep Routes ====================
    if (path === '/sheep' && method === 'GET') {
      const snapshot = await db.collection('sheep').get();
      const sheep: Sheep[] = [];
      snapshot.forEach(doc => {
        sheep.push({ id: doc.id, ...doc.data() } as Sheep);
      });
      return res.status(200).json(sheep);
    }

    if (path.startsWith('/sheep/') && method === 'GET') {
      const sheepId = path.split('/')[2];
      const sheepDoc = await db.collection('sheep').doc(sheepId).get();

      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "الخروف غير موجود" });
      }

      return res.status(200).json({ id: sheepDoc.id, ...sheepDoc.data() });
    }

    if (path === '/sheep' && method === 'POST') {
      const validation = insertSheepSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: validation.error.errors });
      }

      const sheepDoc = await db.collection('sheep').add({
        ...validation.data,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ id: sheepDoc.id, ...validation.data });
    }

    if (path.startsWith('/sheep/') && method === 'PATCH') {
      const sheepId = path.split('/')[2];
      const validation = insertSheepSchema.partial().safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: validation.error.errors });
      }

      await db.collection('sheep').doc(sheepId).update({
        ...validation.data,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await db.collection('sheep').doc(sheepId).get();
      return res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
    }

    if (path.startsWith('/sheep/') && method === 'DELETE') {
      const sheepId = path.split('/')[2];
      await db.collection('sheep').doc(sheepId).delete();
      return res.status(204).end();
    }

    // ==================== Orders Routes ====================
    if (path === '/orders' && method === 'GET') {
      const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
      const orders: Order[] = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      return res.status(200).json(orders);
    }

    if (path === '/orders' && method === 'POST') {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: validation.error.errors });
      }

      const orderDoc = await db.collection('orders').add({
        ...validation.data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ id: orderDoc.id, ...validation.data, status: 'pending' });
    }

    if (path.startsWith('/orders/') && method === 'PATCH') {
      const orderId = path.split('/')[2];

      await db.collection('orders').doc(orderId).update({
        ...req.body,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await db.collection('orders').doc(orderId).get();
      return res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
    }

    // ==================== Users Routes ====================
    if (path.startsWith('/users/') && method === 'GET') {
      const userId = path.split('/')[2];
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      return res.status(200).json({ uid: userDoc.id, ...userDoc.data() });
    }

    if (path === '/users' && method === 'POST') {
      const validation = insertUserProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: validation.error.errors });
      }

      const { uid, ...userData } = validation.data;
      await db.collection('users').doc(uid).set({
        ...userData,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({ uid, ...userData });
    }

    if (path.startsWith('/users/') && method === 'PATCH') {
      const userId = path.split('/')[2];

      await db.collection('users').doc(userId).update({
        ...req.body,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await db.collection('users').doc(userId).get();
      return res.status(200).json({ uid: updatedDoc.id, ...updatedDoc.data() });
    }

    // ==================== Admins Routes ====================
    if (path === '/admins' && method === 'GET') {
      const snapshot = await db.collection('admins').get();
      const admins: any[] = [];
      snapshot.forEach(doc => {
        admins.push({ uid: doc.id, ...doc.data() });
      });
      return res.status(200).json(admins);
    }

    if (path === '/admins' && method === 'POST') {
      const { uid, email } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ message: "معرف المستخدم والبريد الإلكتروني مطلوبان" });
      }

      await db.collection('admins').doc(uid).set({
        email,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ uid, email });
    }

    if (path.startsWith('/admins/') && method === 'DELETE') {
      const adminId = path.split('/')[2];
      await db.collection('admins').doc(adminId).delete();
      return res.status(204).end();
    }

    return res.status(404).json({ message: "المسار غير موجود" });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: "حدث خطأ في الخادم",
      error: error.message 
    });
  }
}