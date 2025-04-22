
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ThreadList from '@/components/forum/ThreadList';
import CreateThreadDialog from '@/components/forum/CreateThreadDialog';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const DiscussionForum = () => {
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-shield-blue/5 to-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-shield-blue to-shield-blue/60 bg-clip-text text-transparent">
              Discussion Forum
            </h1>
            <p className="text-foreground/60 mt-2">
              Join the conversation and share your thoughts
            </p>
          </div>
          <Button 
            onClick={() => {
              if (!user) {
                toast.error("Please sign in to create a thread");
                return;
              }
              setIsCreateThreadOpen(true);
            }}
            className="flex items-center gap-2 bg-shield-blue hover:bg-shield-blue/90 text-white"
          >
            <MessageSquare className="h-4 w-4" />
            New Thread
          </Button>
        </div>

        <ThreadList />
        <CreateThreadDialog 
          open={isCreateThreadOpen} 
          onOpenChange={setIsCreateThreadOpen} 
        />
      </div>
    </div>
  );
};

export default DiscussionForum;
