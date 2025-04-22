
import React, { useRef, useState } from 'react';
import { Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type DropZoneProps = {
  onFilesAdded: (files: File[]) => void;
  acceptedFileTypes?: string;
};

const DropZone: React.FC<DropZoneProps> = ({ 
  onFilesAdded, 
  acceptedFileTypes = "video/*,image/*" 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log("Files dropped:", e.dataTransfer.files.length);
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Files selected:", e.target.files.length);
      onFilesAdded(Array.from(e.target.files));
      
      // Reset the input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleBrowseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isVideo = acceptedFileTypes.includes('video');

  return (
    <div 
      className={`border-2 border-dashed ${isDragging ? 'border-shield-blue bg-blue-50' : 'border-gray-200'} rounded-xl p-8 text-center mb-6 hover:border-shield-blue transition-colors cursor-pointer`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleBrowseClick}
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-shield-blue/10 flex items-center justify-center mb-4">
        {isDragging ? (
          <Upload className="h-8 w-8 text-shield-blue animate-bounce" />
        ) : (
          <Video className="h-8 w-8 text-shield-blue" />
        )}
      </div>
      <p className="text-gray-600 mb-2">
        {isDragging ? "Drop files here to upload" : `Drag and drop ${isVideo ? "video" : "media"} evidence here`}
      </p>
      <p className="text-sm text-gray-500 mb-4">or</p>
      <Button 
        variant="outline" 
        className="border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all"
        onClick={handleBrowseClick}
      >
        Browse Files
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept={acceptedFileTypes}
        onChange={handleFileChange}
      />
      {isVideo && (
        <p className="mt-4 text-xs text-gray-500">
          Supported formats: MP4, MOV, AVI (max 100MB)
        </p>
      )}
    </div>
  );
};

export default DropZone;
