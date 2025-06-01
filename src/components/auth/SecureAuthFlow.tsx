
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FaceVerification from './FaceVerification';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
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
          console.log("No user found, redirecting to signin");
          toast.error("Please sign in to continue");
          navigate('/signin');
          setIsLoading(false);
          return;
        }
        
        console.log("Checking KYC status for user:", user.email);
        
        // Check if the user has completed KYC verification
        const kycData = await getUserKycStatus(user.email);
        console.log("KYC data received:", kycData);
        setKycStatus(kycData);
        
        if (kycData?.status === 'Approved') {
          console.log("KYC approved, checking for selfie:", kycData.selfie);
          
          // Set selfie URL if available
          if (kycData.selfie) {
            setSelfieFaceUrl(kycData.selfie);
          }
          
          // Check local storage for a flag that indicates we already verified this session
          const hasVerified = localStorage.getItem(`face_verified_${user.id}`);
          
          if (!hasVerified) {
            console.log("Face verification needed - starting verification flow");
            setNeedsFaceVerification(true);
          } else {
            console.log("Face already verified this session");
          }
        } else {
          console.log("KYC not approved, status:", kycData?.status);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        toast.error('Error verifying identity. Please try again.');
        setIsLoading(false);
      }
    };
    
    checkUserStatus();
  }, [user, navigate]);
  
  const handleVerificationSuccess = () => {
    if (user) {
      console.log("Face verification successful for user:", user.id);
      // Set flag in local storage to remember verification for this session
      localStorage.setItem(`face_verified_${user.id}`, 'true');
      setNeedsFaceVerification(false);
      toast.success('Identity verified successfully! Welcome back.');
    }
  };
  
  const handleSOS = async () => {
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
    console.log("User chose to skip verification");
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
        <p className="ml-3 text-lg">Checking authentication status...</p>
        <SOSButton onClick={handleSOS} variant="floating" size="lg" />
      </div>
    );
  }
  
  if (!user) {
    navigate('/signin');
    return null;
  }
  
  if (kycStatus?.status !== 'Approved') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Verification Required</CardTitle>
            <CardDescription className="text-lg">
              You need to complete the e-KYC verification process before accessing this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full text-lg py-6" 
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
          </CardContent>
        </Card>
        <SOSButton onClick={handleSOS} variant="floating" size="lg" />
      </div>
    );
  }
  
  if (needsFaceVerification) {
    console.log("Rendering face verification with selfie URL:", selfieFaceUrl);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">Identity Verification</CardTitle>
            <CardDescription className="text-lg">
              Please verify your identity using face recognition to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FaceVerification
              onSuccess={handleVerificationSuccess}
              onCancel={handleSkipVerification}
              expectedFaceUrl={selfieFaceUrl}
              showSOSButton={false}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Face verification completed or not required, render the children
  return <>{children}</>;
};

export default SecureAuthFlow;
