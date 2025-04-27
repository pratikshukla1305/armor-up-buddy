
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Camera, User, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SOSButton from '../sos/SOSButton';
import { submitSOSAlert } from '@/services/userServices';
import { useAuth } from '@/contexts/AuthContext';

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
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expectedFaceEmbedding, setExpectedFaceEmbedding] = useState<Float32Array | null>(null);
  const [lastVerificationTime, setLastVerificationTime] = useState(0);
  const [showDifferentPersonAlert, setShowDifferentPersonAlert] = useState(false);
  const [noFaceDetectedCount, setNoFaceDetectedCount] = useState(0);
  const [showNoFaceAlert, setShowNoFaceAlert] = useState(false);
  const verificationInterval = 2000; // Verify every 2 seconds during monitoring
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load face-api models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setVerificationMessage('Loading facial recognition models...');
        
        // Check if models are already loaded to avoid reloading
        if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models')
          ]);
        }
        
        setIsModelLoaded(true);
        setVerificationMessage('Facial recognition models loaded successfully. Please start camera.');
        
        if (expectedFaceUrl) {
          await loadExpectedFace(expectedFaceUrl);
        } else {
          console.warn('No reference face URL provided for verification');
        }
      } catch (error) {
        console.error('Error loading facial recognition models:', error);
        setErrorMessage('Failed to load facial recognition models. Please ensure you have a stable internet connection and try again.');
      }
    };
    
    loadModels();
    
    return () => {
      stopStream();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load expected face embedding from URL
  const loadExpectedFace = async (faceUrl: string) => {
    try {
      setVerificationMessage('Loading reference face...');
      
      // Load the expected face image from URL
      const img = await faceapi.fetchImage(faceUrl);
      
      // Detect face in the image
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        setExpectedFaceEmbedding(detection.descriptor);
        setVerificationMessage('Reference face loaded successfully. Ready to verify.');
      } else {
        setErrorMessage('No face detected in the reference image. Please update your profile with a clear face image.');
        console.error('No face detected in reference image');
      }
    } catch (error) {
      console.error('Error loading reference face:', error);
      setErrorMessage('Failed to load reference face. Please check your internet connection or try updating your profile photo.');
    }
  };

  // Start camera stream
  const startCamera = async () => {
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
        setErrorMessage('');
        setVerificationMessage('Camera started. Please position your face in the frame.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Unable to access camera. Please check your camera permissions and try again, or use a device with a camera.');
    }
  };

  // Stop the camera stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    }
  };

  // Start continuous face verification
  const startMonitoring = () => {
    setIsMonitoring(true);
    monitorFace();
  };

  // Monitor face in a loop
  const monitorFace = async () => {
    if (!videoRef.current || !isModelLoaded || !isCameraReady) return;
    
    try {
      // Only verify every few seconds to reduce CPU usage
      const now = Date.now();
      if (now - lastVerificationTime >= verificationInterval) {
        const detections = await faceapi.detectSingleFace(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptor();
          
        const canvas = canvasRef.current;
        if (canvas && videoRef.current) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (detections) {
              // Reset no face counter when a face is detected
              setNoFaceDetectedCount(0);
              if (showNoFaceAlert) setShowNoFaceAlert(false);
              
              // Draw box and landmarks around detected face
              const dims = faceapi.matchDimensions(canvas, videoRef.current, true);
              const resizedDetection = faceapi.resizeResults(detections, dims);
              
              // Draw face box with green color
              ctx.strokeStyle = '#10b981'; // Green color
              ctx.lineWidth = 2;
              
              const { _box: box } = resizedDetection.detection;
              ctx.strokeRect(box._x, box._y, box._width, box._height);
              
              // Add a label above the face box
              ctx.fillStyle = '#10b981';
              ctx.fillRect(box._x, box._y - 25, 100, 25);
              ctx.fillStyle = 'white';
              ctx.font = '16px Arial';
              ctx.fillText('Detected', box._x + 5, box._y - 8);
              
              // Draw landmarks
              faceapi.draw.drawFaceLandmarks(canvas, [resizedDetection]);
              
              // Verify face if we have a reference face
              if (expectedFaceEmbedding) {
                const distance = faceapi.euclideanDistance(expectedFaceEmbedding, detections.descriptor);
                const threshold = 0.5; // Adjust this threshold as needed
                
                // If face doesn't match, show warning
                if (distance > threshold) {
                  setShowDifferentPersonAlert(true);
                }
              }
            } else {
              // Increment counter when no face is detected
              setNoFaceDetectedCount(prev => {
                const newCount = prev + 1;
                // After 3 consecutive checks with no face, show alert
                if (newCount > 3 && !showNoFaceAlert) {
                  setShowNoFaceAlert(true);
                }
                return newCount;
              });
            }
          }
        }
        
        setLastVerificationTime(now);
      }
    } catch (error) {
      console.error('Error in face monitoring:', error);
    }
    
    // Continue monitoring loop if still in monitoring state
    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(monitorFace);
    }
  };

  // Verify face against expected face
  const verifyFace = async () => {
    if (!videoRef.current || !expectedFaceEmbedding) {
      if (!expectedFaceEmbedding) {
        setErrorMessage('Reference face not available. Please ensure your profile has a valid photo.');
      }
      return;
    }
    
    setIsVerifying(true);
    setVerificationMessage('Verifying your identity...');
    
    try {
      const detections = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detections) {
        const distance = faceapi.euclideanDistance(expectedFaceEmbedding, detections.descriptor);
        const threshold = 0.5; // Adjust this threshold as needed
        
        if (distance <= threshold) {
          setVerificationMessage('Verification successful! Continuing to monitor for security.');
          toast.success('Identity verified successfully!');
          
          // Start continuous monitoring
          startMonitoring();
          
          // Call success callback
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          setVerificationMessage('Verification failed. Face does not match the registered face.');
          toast.error('Verification failed. Face does not match the registered face.');
          setIsVerifying(false);
        }
      } else {
        setVerificationMessage('No face detected. Please position yourself clearly in front of the camera.');
        toast.error('No face detected. Please position yourself clearly in front of the camera.');
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      setVerificationMessage('An error occurred during verification. Please try again.');
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
      
      // Navigate to dashboard or emergency page
      navigate('/dashboard');
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      toast.error("Failed to send SOS alert. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md mx-auto">
        {/* Video feed with clear borders and styling */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-4 border-blue-500 shadow-lg">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            autoPlay 
            playsInline 
            onLoadedMetadata={() => setIsCameraReady(true)}
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {/* Status overlay */}
          {(!isModelLoaded || !isCameraReady || isVerifying) && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-3"></div>
                <p className="text-lg font-medium">{verificationMessage || 'Preparing facial verification...'}</p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-lg font-medium">{errorMessage}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 bg-transparent border-white text-white hover:bg-white hover:text-red-900"
                  onClick={onCancel}
                >
                  Go Back
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls with clear visual feedback */}
        <div className="mt-4 space-y-4">
          {!isCameraReady && isModelLoaded && !errorMessage && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" 
              onClick={startCamera}
              disabled={!isModelLoaded}
            >
              <Camera className="mr-2 h-5 w-5" /> Start Camera
            </Button>
          )}
          
          {isCameraReady && isModelLoaded && !isVerifying && !isMonitoring && (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6" 
              onClick={verifyFace}
              disabled={!expectedFaceEmbedding}
            >
              <ShieldCheck className="mr-2 h-5 w-5" /> Verify Identity
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full text-lg py-6" 
            onClick={onCancel}
          >
            <X className="mr-2 h-5 w-5" /> Cancel
          </Button>
          
          {/* Status message with clear visibility */}
          {verificationMessage && !errorMessage && (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <AlertTitle className="text-blue-800">Authentication Status</AlertTitle>
              <AlertDescription className="text-blue-700">
                {verificationMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      {/* Different person alert dialog */}
      <AlertDialog open={showDifferentPersonAlert} onOpenChange={setShowDifferentPersonAlert}>
        <AlertDialogContent className="border-red-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Security Alert!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              A different person has been detected. For security reasons, verification may be required to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowDifferentPersonAlert(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Acknowledge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* No face detected alert dialog */}
      <AlertDialog open={showNoFaceAlert} onOpenChange={setShowNoFaceAlert}>
        <AlertDialogContent className="border-amber-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Face Not Detected</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              No face is currently visible. Please position yourself clearly in front of the camera to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowNoFaceAlert(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Floating SOS Button */}
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
