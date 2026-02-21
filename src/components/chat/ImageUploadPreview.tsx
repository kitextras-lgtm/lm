import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ImageUploadPreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImageUploadPreview({ file, onRemove }: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="relative inline-block">
      <img
        src={previewUrl}
        alt="Upload preview"
        className="w-20 h-20 object-cover rounded-lg"
        style={{ border: '1px solid rgba(75, 85, 99, 0.2)' }}
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 rounded-full transition-colors"
        style={{ backgroundColor: '#1a1a1e', border: '1px solid rgba(75, 85, 99, 0.2)' }}
      >
        <X className="w-3.5 h-3.5" style={{ color: 'var(--text-primary)' }} />
      </button>
    </div>
  );
}


