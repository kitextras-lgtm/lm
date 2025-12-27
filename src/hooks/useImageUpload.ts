import { useState } from 'react';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '012774bd056a91a1055131cf67c1a486'; // Get from environment variable or use fallback

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.url) {
          return data.data.url;
        }
      }

      // Fallback to base64 if API fails
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          console.error('Failed to process image');
          reject(new Error('Failed to read image'));
        };
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Image upload error:', error);
      // Fallback to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          console.error('Failed to process image');
          reject(new Error('Failed to read image'));
        };
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}


