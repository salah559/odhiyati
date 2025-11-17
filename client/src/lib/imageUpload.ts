
const IMGBB_API_KEY = "caf89c5bb76bf12707faa97909e47101"; // مفتاح API عام للتجربة

export async function uploadImage(file: File): Promise<string> {
  try {
    // تحويل الملف إلى base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // إزالة البادئة data:image/...;base64,
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // رفع الصورة إلى ImgBB
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ImgBB error:', errorData);
      throw new Error('فشل رفع الصورة إلى ImgBB');
    }

    const data = await response.json();
    
    if (!data.success || !data.data?.url) {
      throw new Error('استجابة غير صالحة من ImgBB');
    }

    return data.data.url;
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    throw new Error('فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
  }
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('خطأ في رفع الصور:', error);
    throw new Error('فشل رفع بعض الصور');
  }
}

export async function uploadImageToDatabase(file: File): Promise<{ id: number; imageUrl: string }> {
  try {
    // تحويل الملف إلى base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // رفع الصورة إلى السيرفر
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64,
        mimeType: file.type,
        originalFileName: file.name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل رفع الصورة');
    }

    const data = await response.json();
    return {
      id: data.id,
      imageUrl: data.imageUrl,
    };
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    throw error;
  }
}
