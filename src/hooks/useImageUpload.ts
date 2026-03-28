import { useState } from 'react';
import type { DragEvent } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useImageUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const setUploadedImage = useAppStore((state) => state.setUploadedImage);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG files are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedImage(file, url);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0] ?? null;
    handleFileChange(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return {
    isDragging,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
}
