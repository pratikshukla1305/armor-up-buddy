import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { getUserVerificationStatus, VerificationStatus } from '@/data/kycVerificationsData';

interface KycCompletedProps {
  status?: VerificationStatus;
  userId?: string;
  onReset?: () => void;
}

const KycCompleted = ({ 
  status: initialStatus = 'pending',
  userId = "user-123",
  onReset 
}: KycCompletedProps) => {
  const [status, setStatus] = useState<VerificationStatus>(initialStatus);
  
  useEffect(() => {
    const checkStatus = () => {
      const currentStatus = getUserVerificationStatus(userId);
      if (currentStatus !== 'none' && currentStatus !== status) {
        setStatus(currentStatus);
      }
    };
    
    checkStatus();
    
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [userId, status]);
  
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Identity Verification Status</CardTitle>
        <CardDescription>
          {status === 'pending' 
            ? 'Your verification is being reviewed by our team'
            : status === 'approved'
              ? 'Your identity has been successfully verified'
              : status === 'rejected'
                ? 'Your identity verification has been rejected'
                : 'Your identity verification status is unknown'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {status === 'pending' && (
          <div className="text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 mb-4">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Verification In Progress</h3>
            <p className="text-gray-500 mb-4">
              We're currently reviewing your submitted documents. This typically takes 1-2 business days.
            </p>
          </div>
        )}
        
        {status === 'approved' && (
          <div className="text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Verification Approved</h3>
            <p className="text-gray-500 mb-4">
              Your identity has been successfully verified. You now have full access to all features.
            </p>
          </div>
        )}
        
        {status === 'rejected' && (
          <div className="text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 mb-4">
              <X className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Verification Rejected</h3>
            <p className="text-gray-500 mb-4">
              Unfortunately, we couldn't verify your identity with the provided documents. Please retry with clearer documents.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Possible reasons for rejection:</h4>
                <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                  <li>The document image was blurry or unclear</li>
                  <li>The selfie didn't match the ID photo</li>
                  <li>The document appears to be expired or invalid</li>
                  <li>Information on the document was not legible</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {status === 'rejected' && (
          <Button 
            className="w-full max-w-xs" 
            onClick={onReset ? onReset : () => window.location.reload()}
          >
            Try Again
          </Button>
        )}
        {status === 'approved' && (
          <Button variant="outline" className="w-full max-w-xs" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        )}
        {(status === 'pending' || status === 'none') && (
          <Button variant="outline" className="w-full max-w-xs" onClick={() => window.location.href = "/"}>
            Return Later
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default KycCompleted;
