
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
  const verificationInterval = 2000;

  const drawFaceDetection = (
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    detection: any
  ) => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detection) {
      const dims = faceapi.matchDimensions(canvas, video, true);
      const resizedDetection = faceapi.resizeResults(detection, dims);
      
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      
      const box = resizedDetection.detection.box;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      ctx.fillStyle = '#10b981';
      ctx.fillRect(box.x, box.y - 25, 100, 25);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('Detected', box.x + 5, box.y - 8);
      
      faceapi.draw.drawFaceLandmarks(canvas, [resizedDetection]);
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
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
