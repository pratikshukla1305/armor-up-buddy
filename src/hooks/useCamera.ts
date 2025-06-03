
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
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 }
        } 
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream obtained:', stream);
      
      if (videoRef.current) {
        console.log('Setting video source and starting playback');
        videoRef.current.srcObject = stream;
        
        // Create a promise that resolves when video is ready to play
        await new Promise((resolve, reject) => {
          const video = videoRef.current!;
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout'));
          }, 10000); // 10 second timeout
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded');
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve(true);
          };
          
          const onError = (error: any) => {
            console.error('Video error:', error);
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(error);
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // If metadata is already loaded, resolve immediately
          if (video.readyState >= 1) {
            onLoadedMetadata();
          }
        });
        
        console.log('Starting video playback');
        await videoRef.current.play();
        
        // Wait for video to actually start playing
        await new Promise((resolve) => {
          const checkPlaying = () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && !videoRef.current.paused) {
              console.log('Video is playing and ready');
              resolve(true);
            } else {
              setTimeout(checkPlaying, 100);
            }
          };
          checkPlaying();
        });
        
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
