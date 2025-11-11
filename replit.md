# أضحيتي - Adhiyati E-commerce Platform

## نظرة عامة
منصة إلكترونية عربية احترافية لبيع الأغنام والأضاحي، مصممة خصيصاً للسوق الناطق بالعربية مع واجهة RTL كاملة.

## آخر التحديثات (November 2025)

### تحسينات نموذج الطلب (11 نوفمبر 2025)
- ✅ **إزالة حقل الإيميل**: تبسيط عملية الطلب بإزالة البريد الإلكتروني
- ✅ **نظام الولايات والبلديات**: 
  - إضافة اختيار الولاية (48 ولاية)
  - اختيار البلدية حسب الولاية (1541 بلدية)
  - بيانات شاملة للجزائر
- ✅ **إزالة حقل العنوان التفصيلي**: العنوان الآن اختياري في الملاحظات
- ✅ **نموذج طلب مبسط**: الآن يحتاج فقط:
  - الاسم الكامل
  - رقم الهاتف
  - الولاية والبلدية
  - ملاحظات (اختياري)

### تحسينات التصميم الحديث
- ✨ **نظام ألوان محدّث**: ألوان عصرية باللون الأخضر الزمردي والذهبي الدافئ
- ✨ **لوقو احترافي**: إضافة اللوقو المخصص في الهيدر والصفحة الرئيسية
- ✨ **Hero Section حديث**: تصميم بطولي مع أنماط إسلامية وتأثيرات متحركة
- ✨ **بطاقات منتجات محسّنة**: 
  - تأثيرات hover متقدمة مع زر "عرض التفاصيل"
  - شارات مميزة للتخفيضات والمنتجات المميزة
  - تدرجات لونية وظلال احترافية
- ✨ **صفحة تفاصيل محسّنة**:
  - معرض صور محسّن مع عداد
  - كروت مواصفات فاخرة
  - تصميم متجاوب وجذاب

## التقنيات المستخدمة

### Frontend
- **React** - مكتبة واجهة المستخدم
- **TypeScript** - لكتابة كود آمن من الأخطاء
- **Tailwind CSS** - تصميم حديث ومتجاوب
- **Shadcn UI** - مكونات واجهة احترافية
- **Wouter** - للتوجيه بين الصفحات
- **TanStack Query** - لإدارة البيانات والـ cache
- **Cairo/Noto Sans Arabic** - خطوط عربية جميلة

### Backend
- **Express.js** - خادم Node.js
- **Firebase Authentication** - نظام تسجيل دخول آمن (Google + Email/Password)
- **Firebase Firestore** - قاعدة بيانات سحابية
- **Firebase Storage** - لتخزين الصور

## الميزات الرئيسية

### للمستخدمين
- ✅ تصفح المنتجات مع فلترة متقدمة
- ✅ معرض صور متعدد لكل منتج
- ✅ نظام طلبات سهل وسريع
- ✅ تسجيل دخول عبر Google أو البريد الإلكتروني
- ✅ واجهة عربية كاملة RTL
- ✅ تصميم متجاوب لجميع الأجهزة

### للمدراء
- ✅ لوحة إدارة متكاملة
- ✅ إدارة المنتجات (إضافة/تعديل/حذف)
- ✅ إدارة الطلبات وتغيير حالاتها
- ✅ نظام التخفيضات
- ✅ إضافة وإزالة مدراء فرعيين
- ✅ إحصائيات ولوحة تحكم

## الصلاحيات
- **المدير الرئيسي**: bouazzasalah120120@gmail.com
  - يملك جميع الصلاحيات
  - يمكنه إضافة وإزالة المدراء
  - لا يمكن إزالته

- **المدراء الفرعيون**:
  - يمكنهم إدارة المنتجات والطلبات
  - لا يمكنهم إضافة أو إزالة مدراء آخرين

## هيكل المشروع

```
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # مكونات قابلة لإعادة الاستخدام
│   │   ├── pages/           # صفحات التطبيق
│   │   ├── contexts/        # Auth Context
│   │   ├── lib/             # Firebase config & utilities
│   │   └── App.tsx          # التطبيق الرئيسي
│   └── index.html
├── server/                   # Backend Express
│   ├── routes.ts            # API endpoints
│   └── index.ts
├── shared/                   # Shared types
│   └── schema.ts            # Data models & Zod schemas
└── design_guidelines.md     # إرشادات التصميم
```

## API Endpoints

### Sheep (المنتجات)
- `GET /api/sheep` - جلب جميع المنتجات
- `GET /api/sheep/:id` - جلب منتج واحد
- `POST /api/sheep` - إضافة منتج (Admin only)
- `PATCH /api/sheep/:id` - تحديث منتج (Admin only)
- `DELETE /api/sheep/:id` - حذف منتج (Admin only)

### Orders (الطلبات)
- `GET /api/orders` - جلب جميع الطلبات (Admin only)
- `POST /api/orders` - إنشاء طلب جديد
- `PATCH /api/orders/:id` - تحديث حالة الطلب (Admin only)

### Admins (المدراء)
- `GET /api/admins` - جلب قائمة المدراء (Primary Admin only)
- `POST /api/admins` - إضافة مدير جديد (Primary Admin only)
- `DELETE /api/admins/:id` - إزالة مدير (Primary Admin only)

## النشر على Replit (Current Platform)

### المتطلبات المكتملة
1. ✅ Firebase Configuration - تم إعداد متغيرات البيئة التالية في Secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
2. ✅ Development Workflow - تم إعداد `npm run dev` للتشغيل على المنفذ 5000
3. ✅ Deployment Configuration - تم إعداد autoscale مع `npm run build` و `npm run start`

### حالة التطبيق
✅ **التطبيق جاهز للعمل بالكامل!** البنية التحتية مكتملة ويعمل التطبيق على Replit.

### ملاحظة حول قاعدة البيانات
التطبيق يستخدم **Firebase Firestore** حصرياً لتخزين البيانات:
- جميع عمليات البيانات (الأغنام، الطلبات، المدراء) تتم من جانب العميل مباشرة مع Firestore
- الأمان محمي بواسطة Firestore Security Rules
- الخادم يقوم فقط بتقديم الواجهة الأمامية وإدارة التوجيه

**ملاحظة:** تم إضافة Drizzle ORM + PostgreSQL في الكود للاستخدام المستقبلي، لكنها غير نشطة حالياً. إذا أردت استخدام PostgreSQL في المستقبل:
1. افتح قسم "Tools" في الشريط الجانبي
2. اختر "PostgreSQL Database"
3. انقر على "Create Database"
4. شغّل الترحيلات: `npm run db:push`

## النشر على Vercel (Previous Platform)

### المتطلبات
1. حساب Firebase مع:
   - Authentication مفعّل (Google + Email/Password)
   - Firestore Database
   - Firebase Storage
   - **Firestore Security Rules محدّثة** (مهم جداً!)
2. حساب Vercel

### خطوات النشر

#### 1. إعداد Firebase Security Rules (خطوة حاسمة!)

**يجب تطبيق هذه القواعد في Firestore قبل النشر:**

```javascript
// انسخ محتوى ملف firestore.rules والصقه في:
// Firebase Console > Firestore Database > Rules

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isPrimaryAdmin() {
      return isAuthenticated() && request.auth.token.email == 'bouazzasalah120120@gmail.com';
    }
    
    function isAdmin() {
      return isPrimaryAdmin() || 
             (isAuthenticated() && exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }
    
    match /sheep/{sheepId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /orders/{orderId} {
      allow create: if isAuthenticated();
      allow read, update: if isAdmin();
      allow delete: if false;
    }
    
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow create, delete: if isPrimaryAdmin();
      allow update: if false;
    }
  }
}
```

#### 2. إعداد Firebase Authentication

```bash
# قم بتسجيل الدخول إلى Firebase Console
https://console.firebase.google.com/

# أضف نطاق Vercel إلى Authorized domains:
# Authentication > Settings > Authorized domains
# أضف: your-project.vercel.app
```

#### 3. إعداد Vercel
```bash
# قم بتثبيت Vercel CLI (اختياري)
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel
```

#### 4. إعداد Environment Variables في Vercel
في لوحة تحكم Vercel، أضف المتغيرات التالية:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_PROJECT_ID=your-project-id
```

#### 5. إعداد vercel.json
تأكد من وجود ملف `vercel.json` في جذر المشروع:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ملاحظات مهمة
- تأكد من إضافة نطاق Vercel الخاص بك إلى Authorized domains في Firebase
- قد تحتاج لتحديث قواعد Firestore Security Rules للإنتاج
- استخدم Firebase Console لمراقبة الاستخدام والتكاليف

## التطوير المحلي

```bash
# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

الموقع سيعمل على: http://localhost:5000

## إعداد Firebase الأولي

### 1. إنشاء المشروع
- اذهب إلى Firebase Console
- أنشئ مشروع جديد
- فعّل Google Analytics (اختياري)

### 2. إعداد Authentication
- فعّل Google Sign-in
- فعّل Email/Password Sign-in
- أضف authorized domains للتطوير والإنتاج

### 3. إعداد Firestore
- أنشئ قاعدة بيانات Firestore
- اختر الموقع الأقرب
- ابدأ في production mode أو test mode

### 4. إعداد Storage
- فعّل Firebase Storage
- استخدم القواعد الافتراضية أو خصصها

## نموذج البيانات

### Sheep (الأغنام)
```typescript
{
  id: string;
  name: string;
  category: "كبش" | "نعجة" | "خروف";
  price: number;
  discountPercentage?: number;
  images: string[];
  age: string;
  weight: string;
  breed: string;
  healthStatus: string;
  description: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Order (الطلب)
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  shippingAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## الدعم والمساعدة
للمشاكل التقنية أو الاستفسارات، راجع:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)

## الترخيص
هذا المشروع خاص بالعميل.

## التحديثات المستقبلية
- [ ] نظام الدفع الإلكتروني
- [ ] إشعارات للمدراء
- [ ] تقييمات ومراجعات المنتجات
- [ ] تقارير مبيعات متقدمة
- [ ] نظام بحث وفلترة محسّن
