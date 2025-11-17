import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageData, mimeType, originalFileName } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ message: 'بيانات الصورة مطلوبة' });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      return res.status(400).json({ message: 'نوع الصورة غير مدعوم' });
    }

    if (typeof imageData !== 'string' || imageData.length === 0) {
      return res.status(400).json({ message: 'بيانات الصورة غير صالحة' });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'مفتاح API غير موجود. تأكد من إضافة IMGBB_API_KEY في إعدادات Vercel' });
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
      const errorText = await imgbbResponse.text();
      console.error('ImgBB error:', errorText);
      let errorMessage = 'فشل في رفع الصورة إلى ImgBB';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error:', e);
      }
      return res.status(500).json({ message: errorMessage });
    }

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success || !imgbbData.data) {
      return res.status(500).json({ message: 'فشل في رفع الصورة إلى ImgBB' });
    }

    // Return image data - Note: Without database, we can't save metadata
    // You'll need to handle this differently or use a database
    return res.status(200).json({ 
      id: Date.now(), // Temporary ID
      imageUrl: imgbbData.data.url,
      thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: error.message || 'فشل في رفع الصورة' });
  }
}
