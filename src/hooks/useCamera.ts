
import { useState, useRef } from 'react';

export const useCamera = () => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (videoRef: React.RefObject<HTMLVideoElement>) => {
    try {
      console.log('Starting camera...');
      
      if (streamRef.current) {
        console.log('Stopping existing stream before starting new one');
        stopStream();
      }
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const constraints = { 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream obtained');
      
      if (videoRef.current) {
        console.log('Setting video source and starting playback');
        videoRef.current.srcObject = stream;
        
        // Wait for the video to load metadata
        await new Promise((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
            videoRef.current.onerror = reject;
          }
        });
        
        console.log('Video metadata loaded, starting playback');
        await videoRef.current.play();
        
        streamRef.current = stream;
        setIsCameraReady(true);
        console.log('Camera started successfully');
        return { success: true };
      } else {
        throw new Error('Video element not available');
      }
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
    }
  };

  const stopStream = () => {
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
  };

  return {
    isCameraReady,
    setIsCameraReady,
    startCamera,
    stopStream
  };
};
