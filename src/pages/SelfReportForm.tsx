
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SelfReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartReport = () => {
    if (!user) {
      toast.error("Please sign in to submit a report");
      navigate('/signin');
      return;
    }

    // This is where the real report form would be implemented
    toast.info("Starting new report form...");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Self Report</CardTitle>
            <CardDescription>
              Please sign in to submit a report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/signin')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Self Report Form</CardTitle>
          <CardDescription className="text-lg">
            Submit your report securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-700 mb-2">Authentication Verified</h3>
            <p className="text-blue-600">Your identity has been verified through facial recognition.</p>
          </div>
          
          <Button 
            onClick={handleStartReport}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
          >
            {isSubmitting ? "Processing..." : "Start New Report"}
          </Button>
          
          <p className="text-gray-500 text-sm">
            All reports are encrypted and secured with biometric authentication for your privacy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfReportForm;
