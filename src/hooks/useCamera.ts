
import { useState, useRef } from 'react';

export const useCamera = () => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (videoRef: React.RefObject<HTMLVideoElement>) => {
    try {
      if (streamRef.current) {
        stopStream();
      }
      
      const constraints = { 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        setIsCameraReady(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      return { 
        success: false, 
        error: 'Unable to access camera. Please check your camera permissions and try again, or use a device with a camera.' 
      };
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    }
  };

  return {
    isCameraReady,
    setIsCameraReady,
    startCamera,
    stopStream
  };
};
