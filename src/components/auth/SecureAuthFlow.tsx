
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FaceVerification from './FaceVerification';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserKycStatus } from '@/services/userServices';
import SOSButton from '../sos/SOSButton';

interface SecureAuthFlowProps {
  children: React.ReactNode;
}

const SecureAuthFlow: React.FC<SecureAuthFlowProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [needsFaceVerification, setNeedsFaceVerification] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [selfieFaceUrl, setSelfieFaceUrl] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setIsLoading(true);
        
        if (!user || !user.email) {
          // If no user is logged in, no need for face verification
          setIsLoading(false);
          return;
        }
        
        // Check if the user has completed KYC verification
        const kycData = await getUserKycStatus(user.email);
        setKycStatus(kycData);
        
        if (kycData?.status === 'Approved' && kycData?.selfie) {
          setSelfieFaceUrl(kycData.selfie);
          
          // Check local storage for a flag that indicates we already verified this session
          const hasVerified = localStorage.getItem(`face_verified_${user.id}`);
          
          if (!hasVerified) {
            setNeedsFaceVerification(true);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        toast.error('Error verifying identity. Please try again.');
        setIsLoading(false);
      }
    };
    
    checkUserStatus();
  }, [user]);
  
  const handleVerificationSuccess = () => {
    if (user) {
      // Set flag in local storage to remember verification for this session
      localStorage.setItem(`face_verified_${user.id}`, 'true');
      setNeedsFaceVerification(false);
      toast.success('Identity verified successfully! Welcome back.');
    }
  };
  
  const handleSOS = async () => {
    // Implement SOS functionality
    try {
      toast.info("SOS alert sent! Help is on the way.", {
        duration: 5000,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error sending SOS alert:', error);
    }
  };
  
  const handleSkipVerification = () => {
    toast.warning('Skipping verification for this session.', { duration: 3000 });
    setNeedsFaceVerification(false);
  };
  
  const handleRedirectToKyc = () => {
    navigate('/e-kyc');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Checking authentication status...</p>
        <SOSButton onClick={handleSOS} variant="floating" size="lg" />
      </div>
    );
  }
  
  if (!user) {
    // User is not logged in, no need for face verification
    return <>{children}</>;
  }
  
  if (kycStatus?.status !== 'Approved') {
    // KYC not completed or not approved, prompt to complete it
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
          <p className="mb-6 text-gray-600">
            You need to complete the e-KYC verification process before accessing this feature.
          </p>
          <Button 
            className="w-full mb-4" 
            onClick={handleRedirectToKyc}
          >
            Complete E-KYC Verification
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
          <SOSButton onClick={handleSOS} variant="floating" size="lg" />
        </Card>
      </div>
    );
  }
  
  if (needsFaceVerification) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
          <p className="mb-6 text-gray-600">
            Please verify your identity using face recognition.
          </p>
          
          <FaceVerification
            onSuccess={handleVerificationSuccess}
            onCancel={handleSkipVerification}
            expectedFaceUrl={selfieFaceUrl}
          />
        </Card>
      </div>
    );
  }
  
  // Face verification completed or not required, render the children
  return <>{children}</>;
};

export default SecureAuthFlow;
