
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ForumFileUpload from './ForumFileUpload';
import { Image, FileVideo, X } from 'lucide-react';

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateThreadDialog: React.FC<CreateThreadDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .insert({
          title: data.title,
          content: data.content,
          user_id: user?.id,
          is_anonymous: data.isAnonymous,
          media_urls: mediaUrls
        });

      if (error) throw error;

      toast.success('Thread created successfully!');
      setMediaUrls([]);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create thread');
    }
  };

  const handleMediaUpload = (urls: string[]) => {
    setMediaUrls(prev => [...prev, ...urls]);
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Thread</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Title</Label>
            <Input 
              id="title"
              {...register('title', { required: true })}
              placeholder="Enter thread title"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base">Content</Label>
            <Textarea 
              id="content"
              {...register('content', { required: true })}
              placeholder="Share your thoughts..."
              rows={5}
              className="resize-none"
            />
          </div>

          <ForumFileUpload onUploadComplete={handleMediaUpload} />

          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative group">
                  {url.toLowerCase().includes('.mp4') ? (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <FileVideo className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img 
                      src={url} 
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="isAnonymous" {...register('isAnonymous')} />
            <Label htmlFor="isAnonymous" className="text-sm">Post anonymously</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
