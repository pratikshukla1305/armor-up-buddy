import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCameraContext } from '@/contexts/CameraContext';

// A persistent bottom-right live camera preview that keeps the camera active while logged in
const PersistentCamera: React.FC = () => {
  const { user } = useAuth();
  const { isActive, attach } = useCameraContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (user && videoRef.current) {
      attach(videoRef);
    }
  }, [user, attach]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <div className="bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-lg rounded-xl border border-black/10 dark:border-white/10 p-3 w-56">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium">Live Camera</span>
          </div>
          <button
            className="text-xs px-2 py-1 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
        </div>
        {!collapsed && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black/60">
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-[11px] text-white/80">Starting camera…</div>
            )}
          </div>
        )}
        <div className="mt-2 text-[10px] text-muted-foreground">
          For your security, video stays active while you use the app.
        </div>
      </div>
    </div>
  );
};

export default PersistentCamera;
