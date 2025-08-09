import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CameraContextValue {
  stream: MediaStream | null;
  isActive: boolean;
  start: () => Promise<{ success: boolean; error?: string }>;
  stop: () => void;
  attach: (videoRef: React.RefObject<HTMLVideoElement>) => Promise<boolean>;
}

const CameraContext = createContext<CameraContextValue | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const isStartingRef = useRef(false);

  const start = useCallback(async () => {
    if (isStartingRef.current) {
      console.log('Global camera start already in progress');
      return { success: true };
    }

    try {
      isStartingRef.current = true;

      if (streamRef.current && streamRef.current.active) {
        console.log('Global camera: reusing existing active stream');
        setIsActive(true);
        return { success: true };
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        return { success: false, error: 'Camera not supported in this browser' };
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      console.log('Global camera: requesting user media');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!stream.active) {
        return { success: false, error: 'Camera stream inactive' };
      }
      streamRef.current = stream;
      setIsActive(true);
      console.log('Global camera: stream obtained');
      return { success: true };
    } catch (error: any) {
      console.error('Global camera start error:', error);
      let msg = 'Unable to access camera.';
      if (error?.name === 'NotAllowedError') msg += ' Permission denied.';
      if (error?.name === 'NotFoundError') msg += ' No camera found.';
      if (error?.name === 'NotReadableError') msg += ' Camera in use by another app.';
      if (error?.message) msg += ' ' + error.message;
      return { success: false, error: msg };
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    console.log('Global camera: stop requested');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const attach = useCallback(async (videoRef: React.RefObject<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video) return false;

    if (!streamRef.current || !streamRef.current.active) {
      const res = await start();
      if (!res.success) return false;
    }

    try {
      video.srcObject = streamRef.current as MediaStream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      await video.play().catch(() => {});
      console.log('Global camera: stream attached to video');
      return true;
    } catch (e) {
      console.error('Global camera: failed to attach stream to video', e);
      return false;
    }
  }, [start]);

  // Auto-start when user is logged in; stop when logged out
  useEffect(() => {
    if (user) {
      start();
    } else {
      stop();
    }
  }, [user, start, stop]);

  const value = useMemo<CameraContextValue>(() => ({
    stream: streamRef.current,
    isActive,
    start,
    stop,
    attach,
  }), [isActive, start, stop, attach]);

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCameraContext = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCameraContext must be used within CameraProvider');
  return ctx;
};
