export interface UploadImageResponse {
  id: number;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('فشل في قراءة الملف'));
      }
    };
    reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
  });
}

export async function uploadImageToDatabase(file: File): Promise<number> {
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
      }),
    });

    if (!response.ok) {
      throw new Error('فشل رفع الصورة');
    }

    const data: UploadImageResponse = await response.json();
    return data.id;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'فشل رفع الصورة');
  }
}
