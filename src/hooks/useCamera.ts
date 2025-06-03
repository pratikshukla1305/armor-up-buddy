
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
      
      // Stop any existing stream
      if (streamRef.current) {
        console.log('Stopping existing stream before starting new one');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Reset camera ready state
      setIsCameraReady(false);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const constraints = { 
        video: { 
          width: { ideal: 640, min: 480, max: 1280 },
          height: { ideal: 480, min: 360, max: 720 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15, max: 60 }
        } 
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream obtained:', stream);
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
      
      // Set up the video element
      const video = videoRef.current;
      
      // Clear any existing source
      if (video.srcObject) {
        video.srcObject = null;
      }
      
      // Set the new stream
      video.srcObject = stream;
      
      // Ensure video properties are set correctly
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      
      console.log('Video element configured with stream');
      
      // Verify stream is active
      if (!stream.active) {
        throw new Error('Stream became inactive during setup');
      }
      
      // Store the stream reference
      streamRef.current = stream;
      
      console.log('Camera initialization completed successfully');
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
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Camera constraints could not be satisfied. Please try again.';
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
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
      setIsCameraReady(false);
      console.log('Camera stream stopped and state reset');
    }
  }, []);

  return {
    isCameraReady,
    setIsCameraReady,
    startCamera,
    stopStream
  };
};
