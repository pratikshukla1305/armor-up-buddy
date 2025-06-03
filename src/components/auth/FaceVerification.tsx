
import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SOSButton from '../sos/SOSButton';
import { submitSOSAlert } from '@/services/userServices';
import { useAuth } from '@/contexts/AuthContext';
import { useFaceApi } from '@/hooks/useFaceApi';
import { useCamera } from '@/hooks/useCamera';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import FaceVerificationVideo from './FaceVerificationVideo';
import FaceVerificationControls from './FaceVerificationControls';
import FaceVerificationAlerts from './FaceVerificationAlerts';

interface FaceVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
  expectedFaceUrl?: string;
  showSOSButton?: boolean;
}

const FaceVerification: React.FC<FaceVerificationProps> = ({
  onSuccess,
  onCancel,
  expectedFaceUrl,
  showSOSButton = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    isModelLoaded,
    expectedFaceEmbedding,
    errorMessage,
    verificationMessage,
    setErrorMessage,
    setVerificationMessage,
    loadExpectedFace,
    detectFace,
    compareFaces
  } = useFaceApi();

  const {
    isCameraReady,
    setIsCameraReady,
    startCamera,
    stopStream
  } = useCamera();

  const {
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
  } = useFaceVerification();

  // Load expected face when models are ready
  useEffect(() => {
    console.log('FaceVerification component mounted');
    console.log('Expected face URL:', expectedFaceUrl);
    console.log('Is model loaded:', isModelLoaded);
    
    if (expectedFaceUrl && isModelLoaded) {
      console.log('Loading expected face...');
      loadExpectedFace(expectedFaceUrl);
    } else if (!expectedFaceUrl && isModelLoaded) {
      console.log('No reference face URL provided, but models are loaded');
      setVerificationMessage('Facial recognition models loaded. Ready to start camera for live verification.');
    }
  }, [expectedFaceUrl, isModelLoaded, loadExpectedFace, setVerificationMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('FaceVerification component unmounting, cleaning up...');
      stopStream();
      stopMonitoring();
    };
  }, [stopStream, stopMonitoring]);

  // Start camera handler
  const handleStartCamera = async () => {
    console.log('Start camera button clicked');
    setErrorMessage('');
    setVerificationMessage('Starting camera...');
    
    const result = await startCamera(videoRef);
    console.log('Camera start result:', result);
    
    if (!result.success && result.error) {
      console.error('Failed to start camera:', result.error);
      setErrorMessage(result.error);
      setVerificationMessage('');
    } else {
      console.log('Camera started successfully');
      setVerificationMessage('Camera is ready. Click "Verify Identity" to proceed.');
    }
  };

  // Camera ready callback
  const handleCameraReady = useCallback(() => {
    console.log('Camera ready callback triggered - video is now streaming');
    if (!isCameraReady) {
      setIsCameraReady(true);
      setVerificationMessage('Camera is ready. Click "Verify Identity" to proceed.');
    }
  }, [isCameraReady, setIsCameraReady, setVerificationMessage]);

  // Retry model loading
  const handleRetryModels = useCallback(() => {
    console.log('Retrying model loading...');
    setErrorMessage('');
    setVerificationMessage('Retrying model loading...');
    
    // Force page reload to retry model loading
    window.location.reload();
  }, []);

  // Start continuous face verification
  const startMonitoringFace = () => {
    console.log('Starting face monitoring...');
    setIsMonitoring(true);
    monitorFace();
  };

  // Monitor face in a loop
  const monitorFace = async () => {
    if (!videoRef.current || !isModelLoaded || !isCameraReady) {
      console.log('Cannot monitor face - missing requirements:', {
        video: !!videoRef.current,
        modelLoaded: isModelLoaded,
        cameraReady: isCameraReady
      });
      return;
    }
    
    try {
      const now = Date.now();
      if (now - lastVerificationTime >= verificationInterval) {
        const detections = await detectFace(videoRef.current);
        
        const canvas = canvasRef.current;
        if (canvas && videoRef.current) {
          if (detections) {
            setNoFaceDetectedCount(0);
            if (showNoFaceAlert) setShowNoFaceAlert(false);
            
            drawFaceDetection(canvas, videoRef.current, detections);
            
            // Verify face if we have a reference face
            if (expectedFaceEmbedding) {
              const isMatch = compareFaces(detections.descriptor);
              if (isMatch === false) {
                console.log('Different person detected!');
                setShowDifferentPersonAlert(true);
              }
            }
          } else {
            // Clear canvas when no face detected
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            setNoFaceDetectedCount(prev => {
              const newCount = prev + 1;
              if (newCount > 3 && !showNoFaceAlert) {
                console.log('No face detected for multiple frames, showing alert');
                setShowNoFaceAlert(true);
              }
              return newCount;
            });
          }
        }
        
        setLastVerificationTime(now);
      }
    } catch (error) {
      console.error('Error in face monitoring:', error);
    }
    
    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(monitorFace);
    }
  };

  // Verify face against expected face
  const verifyFace = async () => {
    if (!videoRef.current) {
      console.error('Video element not available for verification');
      toast.error('Camera not available. Please start the camera first.');
      return;
    }
    
    console.log('Starting face verification...');
    setIsVerifying(true);
    setVerificationMessage('Verifying your identity...');
    
    try {
      const detections = await detectFace(videoRef.current);
      
      if (detections) {
        console.log('Face detected during verification');
        
        if (expectedFaceEmbedding) {
          // If we have a reference face, verify against it
          const isMatch = compareFaces(detections.descriptor);
          
          if (isMatch) {
            console.log('Face verification successful!');
            setVerificationMessage('Verification successful! Continuing to monitor for security.');
            toast.success('Identity verified successfully!');
            
            startMonitoringFace();
            
            setTimeout(() => {
              onSuccess();
            }, 1000);
          } else {
            console.log('Face verification failed - no match');
            setVerificationMessage('Verification failed. Face does not match the registered face.');
            toast.error('Verification failed. Face does not match the registered face.');
            setIsVerifying(false);
          }
        } else {
          // If no reference face, just proceed with live monitoring
          console.log('No reference face available, proceeding with live monitoring');
          setVerificationMessage('Face detected. Starting live monitoring...');
          toast.success('Face detected successfully!');
          
          startMonitoringFace();
          
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        console.log('No face detected during verification');
        setVerificationMessage('No face detected. Please position yourself clearly in front of the camera.');
        toast.error('No face detected. Please position yourself clearly in front of the camera.');
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      setVerificationMessage('An error occurred during verification. Please try again.');
      toast.error('An error occurred during verification. Please try again.');
      setIsVerifying(false);
    }
  };

  // Handle SOS button click
  const handleSOS = async () => {
    try {
      toast.info("SOS alert sent! Help is on the way.", {
        duration: 5000,
      });
      
      if (user) {
        await submitSOSAlert({
          reported_by: user.id,
          location: "Current location during authentication",
          status: "New",
          message: "Emergency during authentication process",
          reported_time: new Date().toISOString(),
          emergency_type: "Urgent",
          contact_requested: true
        });
      } else {
        await submitSOSAlert({
          location: "Unknown location during authentication",
          status: "New",
          message: "Emergency during authentication process",
          reported_time: new Date().toISOString(),
          emergency_type: "Urgent",
          contact_requested: true
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      toast.error("Failed to send SOS alert. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md mx-auto">
        <FaceVerificationVideo
          videoRef={videoRef}
          canvasRef={canvasRef}
          isModelLoaded={isModelLoaded}
          isCameraReady={isCameraReady}
          isVerifying={isVerifying}
          verificationMessage={verificationMessage}
          errorMessage={errorMessage}
          onCancel={onCancel}
          onCameraReady={handleCameraReady}
        />
        
        <FaceVerificationControls
          isCameraReady={isCameraReady}
          isModelLoaded={isModelLoaded}
          isVerifying={isVerifying}
          isMonitoring={isMonitoring}
          expectedFaceEmbedding={expectedFaceEmbedding}
          verificationMessage={verificationMessage}
          errorMessage={errorMessage}
          onStartCamera={handleStartCamera}
          onVerifyFace={verifyFace}
          onCancel={onCancel}
          onRetryModels={handleRetryModels}
        />
      </div>
      
      <FaceVerificationAlerts
        showDifferentPersonAlert={showDifferentPersonAlert}
        showNoFaceAlert={showNoFaceAlert}
        onCloseDifferentPersonAlert={() => setShowDifferentPersonAlert(false)}
        onCloseNoFaceAlert={() => setShowNoFaceAlert(false)}
      />
      
      {showSOSButton && (
        <SOSButton 
          onClick={handleSOS}
          variant="floating" 
          size="lg" 
        />
      )}
    </div>
  );
};

export default FaceVerification;
