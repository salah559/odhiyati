export interface ImgBBResponse {
  data: {
    url: string;
    display_url: string;
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_IMGBB_API_KEY غير موجود");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("فشل رفع الصورة إلى ImgBB");
  }

  const data: ImgBBResponse = await response.json();

  if (!data.success) {
    throw new Error("فشل رفع الصورة");
  }

  return data.data.display_url;
}
