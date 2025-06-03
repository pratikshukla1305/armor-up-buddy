
import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isInitializingRef = useRef(false);

  const startCamera = useCallback(async (videoRef: React.RefObject<HTMLVideoElement>) => {
    // Prevent multiple simultaneous initialization attempts
    if (isInitializingRef.current) {
      console.log('Camera initialization already in progress, skipping...');
      return { success: false, error: 'Camera initialization already in progress' };
    }

    try {
      console.log('Starting camera initialization...');
      isInitializingRef.current = true;
      
      if (streamRef.current) {
        console.log('Stopping existing stream before starting new one');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const constraints = { 
        video: { 
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 }
        } 
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream obtained');
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
      
      // Set up the video element
      const video = videoRef.current;
      video.srcObject = stream;
      
      // Wait for the video to be ready and start playing
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video load timeout'));
        }, 10000);
        
        const onLoadedMetadata = () => {
          console.log('Video metadata loaded, starting playback');
          video.play()
            .then(() => {
              console.log('Video playback started successfully');
              clearTimeout(timeout);
              cleanup();
              resolve();
            })
            .catch((playError) => {
              console.error('Video play error:', playError);
              clearTimeout(timeout);
              cleanup();
              reject(playError);
            });
        };
        
        const onError = (error: any) => {
          console.error('Video error during setup:', error);
          clearTimeout(timeout);
          cleanup();
          reject(error);
        };
        
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
        
        // If video is already ready, trigger immediately
        if (video.readyState >= 1) { // HAVE_METADATA
          onLoadedMetadata();
        }
      });
      
      // Verify stream is still active
      if (!stream.active) {
        throw new Error('Stream became inactive during setup');
      }
      
      streamRef.current = stream;
      console.log('Camera started successfully and ready for face detection');
      return { success: true };
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Camera permission was denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera is already in use by another application.';
        } else if (error.message === 'Video load timeout') {
          errorMessage += 'Camera took too long to initialize. Please try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  const stopStream = useCallback(() => {
    console.log('Stopping camera stream');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
      setIsCameraReady(false);
      console.log('Camera stream stopped');
    }
  }, []);

  return {
    isCameraReady,
    setIsCameraReady,
    startCamera,
    stopStream
  };
};
