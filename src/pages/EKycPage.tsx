
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import KycForm from '@/components/ekyc/KycForm';
import KycVerification from '@/components/ekyc/KycVerification';
import KycCompleted from '@/components/ekyc/KycCompleted';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { getUserKycStatus } from '@/services/userServices';
import { useAuth } from '@/contexts/AuthContext';
import SOSButton from '@/components/sos/SOSButton';
import { submitSOSAlert } from '@/services/userServices';

type KycData = {
  fullName: string;
  dob: string;
  nationality: string;
  idType: "passport" | "national_id" | "driving_license";
  idNumber: string;
  address: string;
  phone: string;
  email: string;
};

const EKycPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<string>("form");
  const [kycData, setKycData] = useState<KycData>({
    fullName: "",
    dob: "",
    nationality: "",
    idType: "national_id",
    idNumber: "",
    address: "",
    phone: "",
    email: ""
  });
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    idFront?: File;
    idBack?: File;
    selfie?: File;
  }>({});

  // Get pre-filled data from session storage (after signup)
  useEffect(() => {
    const storedName = sessionStorage.getItem('new_user_fullname');
    const storedEmail = sessionStorage.getItem('new_user_email');
    
    if (storedName || storedEmail || (user && user.email)) {
      setKycData(prevData => ({
        ...prevData,
        fullName: storedName || prevData.fullName,
        email: storedEmail || user?.email || prevData.email
      }));
      
      // Clear the session storage after using it
      sessionStorage.removeItem('new_user_fullname');
      sessionStorage.removeItem('new_user_email');
    }
  }, [user]);

  // Generate a demo user ID if we don't have one from auth
  const userId = user?.id || ("user-" + Math.floor(Math.random() * 1000).toString());

  useEffect(() => {
    // Check if user has existing verification
    const checkExistingVerification = async () => {
      if (kycData.email) {
        setIsLoading(true);
        try {
          const verification = await getUserKycStatus(kycData.email);
          if (verification) {
            setStatus(verification.status?.toLowerCase() as "pending" | "approved" | "rejected" || "pending");
            
            // If already verified, move to completed step
            if (verification.status === 'Approved') {
              setCurrentStep("completed");
            }
          }
        } catch (error) {
          console.error("Error checking KYC status:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (currentStep === "verification" && kycData.email) {
      checkExistingVerification();
    }
  }, [currentStep, kycData.email]);

  const handleFormSubmit = (data: KycData) => {
    // Validate if we're using Indian nationality with Aadhaar
    if (data.nationality.toLowerCase() === 'india' || data.nationality.toLowerCase() === 'indian') {
      // Check if it's a 12-digit number (Aadhaar ID)
      const aadhaarRegex = /^\d{12}$/;
      if (!aadhaarRegex.test(data.idNumber.replace(/\s/g, ''))) {
        toast({
          title: "Invalid Aadhaar Number",
          description: "Please enter a valid 12-digit Aadhaar number without spaces.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setKycData(data);
    setCurrentStep("verification");
    
    toast({
      title: "Personal Information Saved",
      description: "Please complete document verification in the next step."
    });
  };

  const handleVerificationComplete = () => {
    // Only move to completed step after verification is submitted
    setCurrentStep("completed");
    
    toast({
      title: "Verification Submitted",
      description: "Your verification is being processed. You can check the status here."
    });
  };

  const handleKycReset = () => {
    // Reset the form and go back to the beginning
    setCurrentStep("form");
    setKycData({
      fullName: "",
      dob: "",
      nationality: "",
      idType: "national_id",
      idNumber: "",
      address: "",
      phone: "",
      email: ""
    });
    setUploadedDocuments({});
    
    toast({
      title: "KYC Reset",
      description: "You can now start a new KYC verification process."
    });
  };

  const handleSOSAlert = async () => {
    try {
      // Try to get location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationStr = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
          await submitSOSAlert({
            reported_by: user?.id,
            location: locationStr,
            status: "New",
            message: "Emergency triggered from KYC verification page",
            reported_time: new Date().toISOString(),
            emergency_type: "Urgent",
            contact_requested: true
          });
          
          toast({
            title: "SOS Alert Sent",
            description: "Emergency services have been notified."
          });
        },
        async (error) => {
          console.error("Error getting location:", error);
          await submitSOSAlert({
            reported_by: user?.id,
            location: "Unknown location - KYC page",
            status: "New",
            message: "Emergency triggered from KYC verification page",
            reported_time: new Date().toISOString(),
            emergency_type: "Urgent",
            contact_requested: true
          });
          
          toast({
            title: "SOS Alert Sent",
            description: "Emergency services have been notified."
          });
        }
      );
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      toast({
        title: "Error Sending SOS",
        description: "Failed to send SOS alert. Please try again or call emergency services directly.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Electronic Know Your Customer (e-KYC)
            </h1>
            <p className="text-gray-600 mb-8">
              Complete the verification process to access all features of the Shield platform.
            </p>
            
            <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger 
                  value="form" 
                  disabled={currentStep !== "form"}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  1. Personal Information
                </TabsTrigger>
                <TabsTrigger 
                  value="verification" 
                  disabled={currentStep !== "verification" && currentStep !== "completed"}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  2. Document Verification
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  disabled={currentStep !== "completed"}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  3. Verification Complete
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="form" className="mt-0">
                <KycForm onSubmit={handleFormSubmit} formData={kycData} />
              </TabsContent>
              
              <TabsContent value="verification" className="mt-0">
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking verification status...</p>
                  </div>
                ) : (
                  <KycVerification 
                    userId={userId}
                    onComplete={handleVerificationComplete}
                    formData={kycData}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <KycCompleted 
                  status={status}
                  userId={userId}
                  onReset={handleKycReset}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Floating SOS Button */}
      <SOSButton 
        onClick={handleSOSAlert} 
        variant="floating" 
        size="lg" 
      />
    </div>
  );
};

export default EKycPage;
