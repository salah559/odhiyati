export interface UploadImageResponse {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('فشل في قراءة الملف'));
      }
    };
    reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
  });
}

export async function uploadImageToDatabase(file: File): Promise<UploadImageResponse> {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64Data,
        mimeType: mimeType,
        originalFileName: file.name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'فشل رفع الصورة');
    }

    const data: UploadImageResponse = await response.json();
    
    if (!data.id || !data.imageUrl) {
      throw new Error('لم يتم استلام معلومات الصورة من الخادم');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'فشل رفع الصورة');
  }
}
