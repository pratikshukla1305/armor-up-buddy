
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
      
      // Draw using video coordinate space (canvas sized to match video)
      const box = detection.detection.box;

      // Draw the detection box
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Draw the label background
      ctx.fillStyle = '#10b981';
      const labelY = Math.max(0, box.y - 30);
      ctx.fillRect(box.x, labelY, 140, 30);
      
      // Draw the label text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Face Detected', box.x + 5, labelY + 20);
      
      // Draw confidence score
      const confidence = Math.round(detection.detection.score * 100);
      ctx.font = '12px Arial';
      ctx.fillText(`${confidence}%`, box.x + 5, labelY + 8);
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
