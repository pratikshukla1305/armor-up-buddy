
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileVideo, X } from 'lucide-react';
import ForumFileUpload from './ForumFileUpload';

interface ThreadDialogProps {
  thread: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThreadDialog: React.FC<ThreadDialogProps> = ({ 
  thread, 
  open, 
  onOpenChange 
}) => {
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyMediaUrls, setReplyMediaUrls] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (thread?.id) {
      fetchReplies();

      // Subscribe to realtime updates for replies
      const channel = supabase
        .channel('thread-replies')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'forum_replies',
            filter: `thread_id=eq.${thread.id}`
          },
          () => {
            fetchReplies();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [thread?.id]);

  const fetchReplies = async () => {
    if (!thread?.id) return;

    try {
      // Get replies first
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch user profiles for non-anonymous replies
      const repliesWithProfiles = await Promise.all(
        data.map(async (reply) => {
          if (!reply.is_anonymous && reply.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', reply.user_id)
              .single();
              
            if (!profileError) {
              return { ...reply, profiles: profileData };
            }
          }
          return reply;
        })
      );
      
      setReplies(repliesWithProfiles);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!user) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!newReply.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          thread_id: thread.id,
          content: newReply,
          user_id: user.id,
          is_anonymous: isAnonymous,
          media_urls: replyMediaUrls
        });

      if (error) throw error;

      setNewReply('');
      setIsAnonymous(false);
      setReplyMediaUrls([]);
      toast.success('Reply added successfully!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyMediaUpload = (urls: string[]) => {
    setReplyMediaUrls(prev => [...prev, ...urls]);
  };

  const removeReplyMedia = (index: number) => {
    setReplyMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnonymousChange = (checked: boolean) => {
    setIsAnonymous(checked);
  };

  // Add handleDelete function
  const handleDelete = async (id: string, type: 'thread' | 'reply') => {
    try {
      if (type === 'thread') {
        const { error } = await supabase
          .from('forum_threads')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        onOpenChange(false);
        toast.success('Thread deleted successfully');
      } else {
        const { error } = await supabase
          .from('forum_replies')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Reply deleted successfully');
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  if (!thread) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{thread?.title}</DialogTitle>
            {user?.id === thread?.user_id && (
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(thread.id, 'thread')}
                size="sm"
              >
                Delete Thread
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            {thread?.is_anonymous ? (
              <Badge variant="secondary">Anonymous</Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {thread?.profiles?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground font-medium">
                  {thread?.profiles?.full_name || 'Unknown User'}
                </span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {thread && format(new Date(thread.created_at), 'PPp')}
            </span>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>{thread?.content}</p>
          </div>

          {thread?.media_urls && thread.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {thread.media_urls.map((url, index) => (
                <div key={index} className="relative aspect-video">
                  {url.toLowerCase().includes('.mp4') ? (
                    <video 
                      src={url} 
                      controls 
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <img 
                      src={url} 
                      alt={`Thread media ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-6 mt-8">
            <h3 className="font-semibold text-lg">Replies</h3>
            {replies.map((reply) => (
              <div 
                key={reply.id} 
                className="bg-muted p-6 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  {reply.is_anonymous ? (
                    <Badge variant="secondary">Anonymous</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {reply.profiles?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {reply.profiles?.full_name || 'Unknown User'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(reply.created_at), 'PPp')}
                    </span>
                    {user?.id === reply.user_id && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(reply.id, 'reply')}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                <p>{reply.content}</p>

                {reply.media_urls && reply.media_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {reply.media_urls.map((url, index) => (
                      <div key={index} className="relative aspect-video">
                        {url.toLowerCase().includes('.mp4') ? (
                          <video 
                            src={url} 
                            controls 
                            className="w-full h-full rounded-lg"
                          />
                        ) : (
                          <img 
                            src={url} 
                            alt={`Reply media ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="space-y-4 pt-4">
              <Textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder={user ? "Write a reply..." : "Sign in to reply"}
                disabled={!user || isSubmitting}
                rows={3}
                className="resize-none"
              />

              <ForumFileUpload onUploadComplete={handleReplyMediaUpload} />

              {replyMediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {replyMediaUrls.map((url, index) => (
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
                        onClick={() => removeReplyMedia(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="replyAnonymous"
                    checked={isAnonymous}
                    onCheckedChange={handleAnonymousChange}
                    disabled={!user}
                  />
                  <Label htmlFor="replyAnonymous">Reply anonymously</Label>
                </div>
                <Button
                  onClick={handleSubmitReply}
                  disabled={!user || isSubmitting || !newReply.trim()}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThreadDialog;
