
import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SOSButton from '../sos/SOSButton';
import { submitSOSAlert } from '@/services/userServices';
import { useAuth } from '@/contexts/AuthContext';
import { useFaceApi } from '@/hooks/useFaceApi';
import { useCamera } from '@/hooks/useCamera';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { useFaceVerificationSession } from '@/hooks/useFaceVerificationSession';
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
  const initializedRef = useRef(false);
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

  const {
    currentSession,
    isSessionActive,
    startSession,
    recordDetection,
    endSession,
    cleanup
  } = useFaceVerificationSession();

  // Initialize session and load expected face when models are ready
  useEffect(() => {
    console.log('FaceVerification component mounted');
    console.log('Expected face URL:', expectedFaceUrl);
    console.log('Is model loaded:', isModelLoaded);
    
    if (!isModelLoaded || initializedRef.current) {
      return;
    }
    
    const initializeSession = async () => {
      if (isModelLoaded && !isSessionActive) {
        console.log('Initializing face verification session...');
        const session = await startSession(expectedFaceUrl);
        
        if (session && expectedFaceUrl) {
          console.log('Loading expected face...');
          await loadExpectedFace(expectedFaceUrl);
        } else if (session && !expectedFaceUrl) {
          console.log('No reference face URL provided, but session started');
          setVerificationMessage('Facial recognition models loaded. Ready to start camera for live verification.');
        }
        initializedRef.current = true;
      }
    };

    initializeSession();
  }, [expectedFaceUrl, isModelLoaded, isSessionActive, startSession, loadExpectedFace, setVerificationMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('FaceVerification component unmounting, cleaning up...');
      // Do not stop camera stream here to avoid abrupt shutdowns on re-mounts
      stopMonitoring();
      cleanup();
    };
  }, [stopMonitoring, cleanup]);

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
    } else if (result.success) {
      console.log('Camera started successfully');
      setVerificationMessage('Camera is ready. Click "Verify Identity" to proceed.');
    }
  };

  // Camera ready callback - simplified since camera setup is now handled in startCamera
  const handleCameraReady = useCallback(() => {
    console.log('Camera ready callback - this should not be needed anymore');
  }, []);

  // Retry model loading
  const handleRetryModels = useCallback(() => {
    console.log('Retrying model loading...');
    setErrorMessage('');
    setVerificationMessage('Retrying model loading...');
    
    // Force page reload to retry model loading
    window.location.reload();
  }, [setErrorMessage, setVerificationMessage]);

  // Cancel handler: stops camera and monitoring explicitly
  const handleCancel = useCallback(() => {
    console.log('Cancelling face verification, stopping camera and monitoring');
    stopMonitoring();
    stopStream();
    onCancel();
  }, [onCancel, stopMonitoring, stopStream]);

  // Start continuous face monitoring
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
        console.log('Performing face detection...');
        const detections = await detectFace(videoRef.current);
        
        const canvas = canvasRef.current;
        if (canvas && videoRef.current) {
          if (detections) {
            console.log('Face detected in monitoring');
            setNoFaceDetectedCount(0);
            if (showNoFaceAlert) setShowNoFaceAlert(false);
            
            drawFaceDetection(canvas, videoRef.current, detections);
            
            // Record detection in database
            let faceMatch = null;
            if (expectedFaceEmbedding) {
              faceMatch = compareFaces(detections.descriptor);
              if (faceMatch === false) {
                console.log('Different person detected!');
                setShowDifferentPersonAlert(true);
              }
            }
            
            // Record the detection
            await recordDetection(
              true,
              detections.detection.score,
              faceMatch,
              detections.detection.box
            );
          } else {
            console.log('No face detected in monitoring');
            // Clear canvas when no face detected
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            // Record no face detection
            await recordDetection(false);
            
            setNoFaceDetectedCount(prev => {
              const newCount = prev + 1;
              if (newCount > 5 && !showNoFaceAlert) {
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
        console.log('Face detected during verification with confidence:', detections.detection.score);
        
        if (expectedFaceEmbedding) {
          // If we have a reference face, verify against it
          const isMatch = compareFaces(detections.descriptor);
          
          // Record the verification attempt
          await recordDetection(
            true,
            detections.detection.score,
            isMatch,
            detections.detection.box
          );
          
          if (isMatch) {
            console.log('Face verification successful!');
            setVerificationMessage('Verification successful!');
            toast.success('Identity verified successfully!');
            
            // Update session as verified
            await endSession('verified');
            
            // Stop camera explicitly before leaving
            stopMonitoring();
            stopStream();
            onSuccess();
          } else {
            console.log('Face verification failed - no match');
            setVerificationMessage('Verification failed. Face does not match the registered face.');
            toast.error('Verification failed. Face does not match the registered face.');
            await endSession('failed');
            setIsVerifying(false);
          }
        } else {
          // If no reference face, just proceed with live monitoring
          console.log('No reference face available, proceeding with live monitoring');
          setVerificationMessage('Face detected. Starting live monitoring...');
          toast.success('Face detected successfully!');
          
          // Record the detection
          await recordDetection(
            true,
            detections.detection.score,
            null,
            detections.detection.box
          );
          
          // Update session as verified
          await endSession('verified');
          
          // Stop camera explicitly before leaving
          stopMonitoring();
          stopStream();
          onSuccess();
        }
      } else {
        console.log('No face detected during verification');
        setVerificationMessage('No face detected. Please position yourself clearly in front of the camera.');
        toast.error('No face detected. Please position yourself clearly in front of the camera.');
        
        // Record failed detection
        await recordDetection(false);
        
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      setVerificationMessage('An error occurred during verification. Please try again.');
      toast.error('An error occurred during verification. Please try again.');
      
      // End session with error
      await endSession('failed');
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
          onCancel={handleCancel}
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
          onCancel={handleCancel}
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
