
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceVerificationVideoProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isModelLoaded: boolean;
  isCameraReady: boolean;
  isVerifying: boolean;
  verificationMessage: string;
  errorMessage: string;
  onCancel: () => void;
  onCameraReady: () => void;
}

const FaceVerificationVideo: React.FC<FaceVerificationVideoProps> = ({
  videoRef,
  canvasRef,
  isModelLoaded,
  isCameraReady,
  isVerifying,
  verificationMessage,
  errorMessage,
  onCancel,
  onCameraReady
}) => {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-4 border-blue-500 shadow-lg">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
        autoPlay 
        playsInline 
        onLoadedMetadata={onCameraReady}
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
  );
};

export default FaceVerificationVideo;
