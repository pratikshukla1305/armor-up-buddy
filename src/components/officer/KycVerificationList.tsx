import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { getKycVerifications, updateKycVerificationStatus } from '@/services/officerServices';
import { KycVerification } from '@/types/officer';

interface KycVerificationListProps {
  limit?: number;
}

const KycVerificationList = ({ limit }: KycVerificationListProps) => {
  const [verifications, setVerifications] = useState<KycVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<KycVerification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await getKycVerifications();
      console.log("Fetched KYC verifications:", data);
      const limitedData = limit ? data.slice(0, limit) : data;
      setVerifications(limitedData);
    } catch (error: any) {
      console.error("Error fetching KYC verifications:", error);
      toast({
        title: "Error fetching verifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [limit]);

  const handleView = async (verification: KycVerification) => {
    setSelectedVerification(verification);
    setIsDialogOpen(true);
    setActiveTab('details');
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessing(id);
      const officerAction = "Verification approved";
      await updateKycVerificationStatus(id, "Approved", officerAction);
      await fetchVerifications();
      if (isDialogOpen) {
        setIsDialogOpen(false);
      }
      toast({
        title: "Verification Approved",
        description: "The user's identity has been verified successfully.",
      });
    } catch (error: any) {
      console.error("Error approving KYC verification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve verification. The user ID may be invalid.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number, reason = "Verification rejected") => {
    try {
      setProcessing(id);
      await updateKycVerificationStatus(id, "Rejected", reason);
      await fetchVerifications();
      if (isDialogOpen) {
        setIsDialogOpen(false);
      }
      toast({
        title: "Verification Rejected",
        description: "The user's identity verification has been rejected.",
      });
    } catch (error: any) {
      console.error("Error rejecting KYC verification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject verification. The user ID may be invalid.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shield-blue"></div>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No verification requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => (
        <div 
          key={verification.id} 
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            <Avatar>
              <AvatarImage src={verification.selfie || `https://ui-avatars.com/api/?name=${encodeURIComponent(verification.full_name)}&color=7F9CF5&background=EBF4FF`} alt={verification.full_name} />
              <AvatarFallback>{verification.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{verification.full_name}</h4>
              <p className="text-sm text-gray-500">{verification.email}</p>
              <div className="mt-1">
                {getStatusBadge(verification.status || 'Pending')}
              </div>
              {verification.user_id ? (
                <p className="text-xs text-gray-400 mt-1">User ID: {verification.user_id}</p>
              ) : (
                <p className="text-xs text-yellow-500 mt-1">No user ID (demo data)</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2 self-end sm:self-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => handleView(verification)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {(!verification.status || verification.status.toLowerCase() === 'pending') && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  onClick={() => handleApprove(verification.id)}
                  disabled={processing === verification.id}
                >
                  {processing === verification.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => handleReject(verification.id)}
                  disabled={processing === verification.id}
                >
                  {processing === verification.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      ))}

      {selectedVerification && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>KYC Verification Details</DialogTitle>
              <DialogDescription>
                Review user identification documents and information
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">User Details</TabsTrigger>
                <TabsTrigger value="documents">ID Documents</TabsTrigger>
                <TabsTrigger value="selfie">Selfie</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 mb-4 col-span-2">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={selectedVerification.selfie || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVerification.full_name)}&color=7F9CF5&background=EBF4FF`} alt={selectedVerification.full_name} />
                      <AvatarFallback>{selectedVerification.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">{selectedVerification.full_name}</p>
                      <p className="text-sm text-gray-500">{selectedVerification.email}</p>
                      <div className="mt-1">{getStatusBadge(selectedVerification.status || 'Pending')}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
                      <div>
                        <Label className="text-xs text-gray-500">Full Name</Label>
                        <p className="font-medium">{selectedVerification.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Email</Label>
                        <p className="font-medium">{selectedVerification.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Submission Date</Label>
                        <p className="font-medium">
                          {new Date(selectedVerification.submission_date).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedVerification.status || 'Pending')}</div>
                      </div>
                      
                      {selectedVerification.officer_action && (
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">Officer Action</Label>
                          <p className="font-medium">{selectedVerification.officer_action}</p>
                        </div>
                      )}
                      
                      {selectedVerification.rejection_reason && (
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">Rejection Reason</Label>
                          <p className="font-medium text-red-600">{selectedVerification.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="py-2">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">ID Documents</h3>
                    
                    <div className="w-full">
                      {selectedVerification.id_front && (
                        <div className="w-full max-w-md mb-6">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">ID Front</h3>
                          <img 
                            src={selectedVerification.id_front} 
                            alt="ID Front" 
                            className="w-full h-auto rounded-md border"
                          />
                        </div>
                      )}
                      
                      {selectedVerification.id_back && (
                        <div className="w-full max-w-md">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">ID Back</h3>
                          <img 
                            src={selectedVerification.id_back} 
                            alt="ID Back" 
                            className="w-full h-auto rounded-md border"
                          />
                        </div>
                      )}
                      
                      {selectedVerification.documents && selectedVerification.documents.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Documents</h3>
                          {selectedVerification.documents.map((doc, idx) => (
                            <div key={idx} className="mb-4 p-3 border rounded-md">
                              <p className="font-medium">{doc.document_type}</p>
                              <img 
                                src={doc.document_url} 
                                alt={`Document ${idx + 1}`}
                                className="mt-2 w-full h-auto rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!selectedVerification.id_front && !selectedVerification.id_back && 
                       (!selectedVerification.documents || selectedVerification.documents.length === 0) && (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No ID documents available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="selfie" className="py-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Selfie Photo</h3>
                  <div className="flex justify-center">
                    {selectedVerification.selfie ? (
                      <img 
                        src={selectedVerification.selfie} 
                        alt="User Selfie" 
                        className="max-w-full max-h-96 object-contain rounded-md border"
                      />
                    ) : (
                      <div className="text-center py-12">
                        <Avatar className="w-32 h-32 mx-auto">
                          <AvatarFallback className="text-4xl">{selectedVerification.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-gray-500 mt-4">No selfie available</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              
              {(!selectedVerification.status || selectedVerification.status.toLowerCase() === 'pending') && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleReject(selectedVerification.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(selectedVerification.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KycVerificationList;
