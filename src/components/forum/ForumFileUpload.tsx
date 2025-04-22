
import React from 'react';
import { UploadCloud, X, Image, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ForumFileUploadProps {
  onUploadComplete: (urls: string[]) => void;
}

const ForumFileUpload: React.FC<ForumFileUploadProps> = ({ onUploadComplete }) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedUrls: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    try {
      for (const file of files) {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
          continue;
        }

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`File ${file.name} is not an image or video`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('forum_media')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Error uploading ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('forum_media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
        toast.success('Files uploaded successfully');
      }
    } catch (error) {
      toast.error('Error uploading files');
    }
  };

  return (
    <div className="mt-4">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
          <UploadCloud className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Upload images or videos (max 10MB)
          </span>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </label>
    </div>
  );
};

export default ForumFileUpload;
