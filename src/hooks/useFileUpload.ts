
import { useState } from 'react';
import { toast } from 'sonner';

type UploadProgressType = Record<string, number>;

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const addFiles = (newFiles: File[]) => {
    // Validate file types
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('video/') || file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid video or image file`);
      }
      return isValid;
    });
    
    // Validate file sizes
    const maxSize = 100 * 1024 * 1024; // 100MB
    const sizeValidFiles = validFiles.filter(file => {
      const isValidSize = file.size <= maxSize;
      if (!isValidSize) {
        toast.error(`${file.name} exceeds the maximum file size (100MB)`);
      }
      return isValidSize;
    });
    
    if (sizeValidFiles.length === 0) return;
    
    setFiles(prev => [...prev, ...sizeValidFiles]);
    
    // Create preview URLs
    sizeValidFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload progress
      simulateFileUpload(file.name);
    });
    
    toast.success(`${sizeValidFiles.length} file(s) added successfully`);
  };
  
  const removeFile = (index: number) => {
    if (index < 0 || index >= files.length) return;
    
    const fileName = files[index].name;
    
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    
    // Remove from progress tracking
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    
    toast.info("File removed");
  };
  
  const simulateFileUpload = (fileName: string) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Check if all files are uploaded
        setTimeout(() => {
          const allUploaded = Object.values(uploadProgress).every(p => p === 100);
          if (allUploaded) {
            setIsUploading(false);
          }
        }, 500);
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 500);
  };
  
  return {
    files,
    previews,
    uploadProgress,
    isUploading,
    addFiles,
    removeFile,
    setIsUploading
  };
};
