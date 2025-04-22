
import React from 'react';
import { Video, X } from 'lucide-react';

type UploadProgressItemProps = {
  fileName: string;
  preview?: string;
  progress: number;
  onRemove: () => void;
};

const UploadProgressItem: React.FC<UploadProgressItemProps> = ({ 
  fileName, 
  preview, 
  progress, 
  onRemove 
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-shield-light rounded flex items-center justify-center overflow-hidden">
        {preview ? (
          <img src={preview} alt={fileName} className="h-full w-full object-cover" />
        ) : (
          <Video className="h-5 w-5 text-shield-blue" />
        )}
      </div>
      <div className="flex-1">
        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-shield-blue" 
            style={{ width: `${progress || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{fileName}</span>
          <span>{progress === 100 ? 'Complete' : `${progress || 0}%`}</span>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-gray-400 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default UploadProgressItem;
