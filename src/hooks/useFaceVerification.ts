
import { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastVerificationTime, setLastVerificationTime] = useState(0);
  const [noFaceDetectedCount, setNoFaceDetectedCount] = useState(0);
  const [showDifferentPersonAlert, setShowDifferentPersonAlert] = useState(false);
  const [showNoFaceAlert, setShowNoFaceAlert] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const verificationInterval = 1000; // Reduced interval for better responsiveness

  const drawFaceDetection = (
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    detection: any
  ) => {
    // Ensure canvas dimensions match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detection && detection.detection) {
      console.log('Drawing face detection box');
      
      // Get the display dimensions
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Calculate scale factors
      const scaleX = displayWidth / videoWidth;
      const scaleY = displayHeight / videoHeight;
      
      const box = detection.detection.box;
      
      // Scale the detection box to match display size
      const scaledBox = {
        x: box.x * scaleX,
        y: box.y * scaleY,
        width: box.width * scaleX,
        height: box.height * scaleY
      };
      
      // Draw the detection box
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledBox.x, scaledBox.y, scaledBox.width, scaledBox.height);
      
      // Draw the label background
      ctx.fillStyle = '#10b981';
      ctx.fillRect(scaledBox.x, scaledBox.y - 30, 120, 30);
      
      // Draw the label text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Face Detected', scaledBox.x + 5, scaledBox.y - 10);
      
      // Draw confidence score
      const confidence = Math.round(detection.detection.score * 100);
      ctx.font = '12px Arial';
      ctx.fillText(`${confidence}%`, scaledBox.x + 5, scaledBox.y - 25);
    }
  };

  const stopMonitoring = () => {
    console.log('Stopping face monitoring');
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  return {
    isVerifying,
    isMonitoring,
    lastVerificationTime,
    noFaceDetectedCount,
    showDifferentPersonAlert,
    showNoFaceAlert,
    verificationInterval,
    setIsVerifying,
    setIsMonitoring,
    setLastVerificationTime,
    setNoFaceDetectedCount,
    setShowDifferentPersonAlert,
    setShowNoFaceAlert,
    animationFrameRef,
    drawFaceDetection,
    stopMonitoring
  };
};
