
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, User, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface FaceVerificationControlsProps {
  isCameraReady: boolean;
  isModelLoaded: boolean;
  isVerifying: boolean;
  isMonitoring: boolean;
  expectedFaceEmbedding: Float32Array | null;
  verificationMessage: string;
  errorMessage: string;
  onStartCamera: () => void;
  onVerifyFace: () => void;
  onCancel: () => void;
  onRetryModels?: () => void;
}

const FaceVerificationControls: React.FC<FaceVerificationControlsProps> = ({
  isCameraReady,
  isModelLoaded,
  isVerifying,
  isMonitoring,
  expectedFaceEmbedding,
  verificationMessage,
  errorMessage,
  onStartCamera,
  onVerifyFace,
  onCancel,
  onRetryModels
}) => {
  return (
    <div className="mt-4 space-y-4">
      {/* Show retry button if models failed to load */}
      {!isModelLoaded && errorMessage && onRetryModels && (
        <Button 
          className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6" 
          onClick={onRetryModels}
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Retry Loading Models
        </Button>
      )}
      
      {!isCameraReady && isModelLoaded && !errorMessage && (
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" 
          onClick={onStartCamera}
          disabled={!isModelLoaded}
        >
          <Camera className="mr-2 h-5 w-5" /> Start Camera
        </Button>
      )}
      
      {isCameraReady && isModelLoaded && !isVerifying && !isMonitoring && (
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6" 
          onClick={onVerifyFace}
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
          <AlertTitle className="text-blue-800">Status</AlertTitle>
          <AlertDescription className="text-blue-700">
            {verificationMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error message with enhanced visibility */}
      {errorMessage && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FaceVerificationControls;
