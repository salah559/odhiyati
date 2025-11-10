# دليل إعداد Firebase - تفعيل قواعد الأمان

## المشكلة
عند إضافة منتجات من لوحة الإدارة، لا تظهر البيانات. السبب على الأرجح أن قواعد الأمان في Firestore غير منشورة.

## الحل: نشر قواعد الأمان إلى Firebase

### الطريقة 1: عبر Firebase Console (الأسهل)

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. من القائمة الجانبية، اذهب إلى **Firestore Database**
4. اضغط على تبويب **Rules** (القواعد)
5. انسخ القواعد التالية والصقها هناك:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
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
    
    // Sheep collection - readable by all, writable by admins only
    match /sheep/{sheepId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Orders collection - create by authenticated users, read/update by admins
    match /orders/{orderId} {
      allow create: if isAuthenticated();
      allow read, update: if isAdmin();
      allow delete: if false;
    }
    
    // Admins collection - only primary admin can manage
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow create, delete: if isPrimaryAdmin();
      allow update: if false;
    }
  }
}
```

6. اضغط على **Publish** (نشر)

### الطريقة 2: عبر Firebase CLI

إذا كان Firebase CLI مثبت لديك:

```bash
firebase deploy --only firestore:rules
```

## التحقق من أن كل شيء يعمل

1. سجل الدخول إلى التطبيق باستخدام البريد الإلكتروني للمسؤول الرئيسي: `bouazzasalah120120@gmail.com`
2. اذهب إلى لوحة الإدارة (Admin)
3. حاول إضافة منتج جديد
4. يجب أن يظهر المنتج فوراً

## ملاحظات مهمة

- **المسؤول الرئيسي**: فقط البريد الإلكتروني `bouazzasalah120120@gmail.com` له صلاحيات كاملة
- **المسؤولين الثانويين**: يمكن للمسؤول الرئيسي إضافة مسؤولين آخرين من صفحة "إدارة المدراء"
- **البيانات المحفوظة**: جميع البيانات محفوظة في Firebase Firestore وتبقى حتى بعد إعادة تشغيل التطبيق

## استكشاف الأخطاء

إذا استمرت المشكلة بعد نشر القواعد:

1. **تأكد من تسجيل الدخول بحساب المسؤول**: يجب أن تسجل الدخول بـ `bouazzasalah120120@gmail.com`
2. **افحص Console في المتصفح**: اضغط F12 وانظر إلى أي أخطاء في تبويب Console
3. **تحقق من Authentication**: تأكد أن Firebase Authentication مفعّل في مشروعك
4. **تحقق من Firestore**: تأكد أن Firestore Database مُنشأ في مشروعك
