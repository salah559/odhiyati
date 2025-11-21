
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { insertSheepSchema, insertOrderSchema, insertUserProfileSchema, type Image, type Sheep, type Order } from "../shared/schema";

// تهيئة Firebase Admin
let db: any;

function getDb() {
  if (!db) {
    try {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountKey);
      } catch (parseError) {
        throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is valid JSON.');
      }

      if (getApps().length === 0) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      }

      db = getFirestore();
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      throw error;
    }
  }
  return db;
}

export default async function handler(req: any, res: any) {
  // تعيين CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = getDb();
    const { method, url } = req;
    const path = url.split('?')[0];

    // ==================== Images Routes ====================
    if (path === '/api/images' && method === 'POST') {
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

      const imageDoc = await database.collection('images').add({
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

    if (path.startsWith('/api/images/') && method === 'GET') {
      const id = path.split('/')[3];
      const imageDoc = await database.collection('images').doc(id).get();

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
    if (path === '/api/admins/check' && method === 'GET') {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      }

      const adminsSnapshot = await database.collection('admins')
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

    if (path === '/api/admins' && method === 'GET') {
      const adminsSnapshot = await database.collection('admins').get();
      const admins = adminsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.json(admins);
    }

    if (path === '/api/admins' && method === 'POST') {
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      }

      const existingSnapshot = await database.collection('admins')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        return res.status(400).json({ message: "المشرف موجود مسبقاً" });
      }

      const adminDoc = await database.collection('admins').add({
        email,
        role: role || 'secondary',
        addedAt: new Date(),
      });

      const newAdmin = await database.collection('admins').doc(adminDoc.id).get();
      return res.json({ id: newAdmin.id, ...newAdmin.data() });
    }

    if (path.startsWith('/api/admins/') && method === 'DELETE') {
      const id = path.split('/')[3];
      await database.collection('admins').doc(id).delete();
      return res.json({ message: "تم حذف المشرف بنجاح" });
    }

    // ==================== Users Routes ====================
    if (path.startsWith('/api/users/') && method === 'GET') {
      const uid = path.split('/')[3];
      const userDoc = await database.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const userData = userDoc.data();
      return res.json({ ...userData, uid: userDoc.id });
    }

    if (path === '/api/users' && method === 'POST') {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const existingUser = await database.collection('users').doc(validatedData.uid).get();
      
      if (existingUser.exists) {
        return res.status(400).json({ message: "المستخدم موجود مسبقاً" });
      }

      let finalUserType = validatedData.userType;
      if (validatedData.email) {
        const adminsSnapshot = await database.collection('admins')
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

      await database.collection('users').doc(validatedData.uid).set(userData);
      return res.json(userData);
    }

    if (path.startsWith('/api/users/') && method === 'PATCH') {
      const uid = path.split('/')[3];
      const { userType } = req.body;

      if (!userType || !["buyer", "seller", "admin"].includes(userType)) {
        return res.status(400).json({ message: "نوع المستخدم غير صالح" });
      }

      const userDoc = await database.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      await database.collection('users').doc(uid).update({ userType });
      const updatedUser = await database.collection('users').doc(uid).get();
      return res.json({ ...updatedUser.data(), uid: updatedUser.id });
    }

    // ==================== Sheep Routes ====================
    if (path === '/api/sheep' && method === 'GET') {
      const sheepSnapshot = await database.collection('sheep').get();
      const allSheep = await Promise.all(sheepSnapshot.docs.map(async (doc: any) => {
        const sheepData = doc.data() as Sheep;
        const imageUrls: string[] = [];
        
        if (sheepData.imageIds && sheepData.imageIds.length > 0) {
          for (const imageId of sheepData.imageIds) {
            try {
              const imageDoc = await database.collection('images').doc(imageId).get();
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

    if (path.startsWith('/api/sheep/') && method === 'GET') {
      const id = path.split('/')[3];
      const sheepDoc = await database.collection('sheep').doc(id).get();

      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "الخروف غير موجود" });
      }

      const sheepData = sheepDoc.data() as Sheep;
      const imageUrls: string[] = [];
      
      if (sheepData.imageIds && sheepData.imageIds.length > 0) {
        for (const imageId of sheepData.imageIds) {
          try {
            const imageDoc = await database.collection('images').doc(imageId).get();
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

    if (path === '/api/sheep' && method === 'POST') {
      const validation = insertSheepSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0].message 
        });
      }

      const data = validation.data;
      const sheepDoc = await database.collection('sheep').add({
        ...data,
        isFeatured: data.isFeatured || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newSheep = await database.collection('sheep').doc(sheepDoc.id).get();
      return res.json({ id: newSheep.id, ...newSheep.data() });
    }

    if (path.startsWith('/api/sheep/') && method === 'PATCH') {
      const id = path.split('/')[3];
      const sheepDoc = await database.collection('sheep').doc(id).get();

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
      await database.collection('sheep').doc(id).update({
        ...data,
        updatedAt: new Date(),
      });

      const updatedSheep = await database.collection('sheep').doc(id).get();
      return res.json({ id: updatedSheep.id, ...updatedSheep.data() });
    }

    if (path.startsWith('/api/sheep/') && method === 'DELETE') {
      const id = path.split('/')[3];
      await database.collection('sheep').doc(id).delete();
      return res.json({ message: "تم حذف الخروف بنجاح" });
    }

    // ==================== Orders Routes ====================
    if (path === '/api/orders' && method === 'GET') {
      const ordersSnapshot = await database.collection('orders').orderBy('createdAt', 'desc').get();
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

    if (path.startsWith('/api/orders/') && method === 'GET') {
      const id = path.split('/')[3];
      const orderDoc = await database.collection('orders').doc(id).get();

      if (!orderDoc.exists) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      const order = { id: orderDoc.id, ...orderDoc.data() };
      return res.json(order);
    }

    if (path === '/api/orders' && method === 'POST') {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0].message 
        });
      }

      const data = validation.data;
      const orderDoc = await database.collection('orders').add({
        ...data,
        status: data.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newOrder = await database.collection('orders').doc(orderDoc.id).get();
      return res.json({ id: newOrder.id, ...newOrder.data() });
    }

    if (path.startsWith('/api/orders/') && method === 'PATCH') {
      const id = path.split('/')[3];
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "الحالة مطلوبة" });
      }

      const orderDoc = await database.collection('orders').doc(id).get();
      if (!orderDoc.exists) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      await database.collection('orders').doc(id).update({
        status,
        updatedAt: new Date(),
      });

      const updatedOrder = await database.collection('orders').doc(id).get();
      return res.json({ id: updatedOrder.id, ...updatedOrder.data() });
    }

    if (path.startsWith('/api/orders/') && method === 'DELETE') {
      const id = path.split('/')[3];
      await database.collection('orders').doc(id).delete();
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
