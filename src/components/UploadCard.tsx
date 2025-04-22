
import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import DropZone from '@/components/upload/DropZone';
import UploadProgressItem from '@/components/upload/UploadProgressItem';
import { useFileUpload } from '@/hooks/useFileUpload';
import { uploadFilesToSupabase, createDraftReport } from '@/utils/uploadUtils';

type UploadCardProps = {
  className?: string;
};

const UploadCard = ({ className }: UploadCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    files, 
    previews, 
    uploadProgress, 
    isUploading, 
    addFiles, 
    removeFile,
    setIsUploading 
  } = useFileUpload();
  
  const handleContinueToReport = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one video before continuing");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to continue");
      navigate("/signin");
      return;
    }
    
    setIsUploading(true);
    toast.info("Uploading files and creating report...");
    
    try {
      console.log("Starting file upload process...");
      // Upload files to Supabase storage
      const uploadedUrls = await uploadFilesToSupabase(files, user.id);
      
      if (uploadedUrls.length === 0) {
        toast.error("Failed to upload files. Please try again.");
        setIsUploading(false);
        return;
      }
      
      console.log("Files uploaded successfully, URLs:", uploadedUrls);
      
      // Store preview URLs in sessionStorage to use in report
      sessionStorage.setItem('uploadedImages', JSON.stringify(uploadedUrls));
      
      // Create a draft report
      const reportId = uuidv4();
      console.log("Creating draft report with ID:", reportId);
      const success = await createDraftReport(user.id, reportId, uploadedUrls);
      
      if (success) {
        toast.success("Files uploaded and report created successfully!");
        // Navigate to continue report page
        navigate(`/continue-report?id=${reportId}`);
      } else {
        toast.error("Failed to create report. Please try again.");
      }
      
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast.error(`Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Upload Video Evidence</h3>
        <Shield className="h-5 w-5 text-shield-blue" />
      </div>
      
      <DropZone onFilesAdded={addFiles} />
      
      <div className="space-y-4">
        {files.length > 0 ? (
          files.map((file, index) => (
            <UploadProgressItem
              key={index}
              fileName={file.name}
              preview={previews[index]}
              progress={uploadProgress[file.name] || 0}
              onRemove={() => removeFile(index)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No videos uploaded yet</p>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleContinueToReport}
          className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? "Processing..." : "Analyze Video Evidence"}
        </Button>
      </div>
    </div>
  );
};

export default UploadCard;
