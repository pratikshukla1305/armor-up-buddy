import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, MessageSquare, AlertTriangle, Check, ExternalLink, Eye, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { EvidenceResponse } from '@/types/evidence';

interface EvidenceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  incident_date: string;
  response_deadline: string;
  fir_number: string;
  status: 'active' | 'closed' | 'expired';
  created_at: string;
  responses_count?: number;
}

interface EvidenceRequestsListProps {
  limit?: number;
}

const EvidenceRequestsList = ({ limit = 5 }: EvidenceRequestsListProps) => {
  const [requests, setRequests] = useState<EvidenceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EvidenceRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [responsesDialogOpen, setResponsesDialogOpen] = useState(false);
  const [responses, setResponses] = useState<EvidenceResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchEvidenceRequests();
  }, []);

  const fetchEvidenceRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data: requestsData, error } = await supabase
        .from('evidence_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      if (requestsData) {
        const requestsWithResponses = await Promise.all(
          requestsData.map(async (request) => {
            const { count, error: countError } = await supabase
              .from('evidence_responses')
              .select('*', { count: 'exact', head: true })
              .eq('request_id', request.id);
              
            if (countError) console.error("Error counting responses:", countError);
            
            return {
              ...request,
              responses_count: count || 0
            };
          })
        );
        
        setRequests(requestsWithResponses as EvidenceRequest[]);
      }
    } catch (error: any) {
      console.error("Error fetching evidence requests:", error);
      toast.error("Failed to load evidence requests");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponses = async (requestId: string) => {
    setIsLoadingResponses(true);
    try {
      const { data: responseData, error } = await supabase
        .from('evidence_responses')
        .select('*')
        .eq('request_id', requestId)
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      
      if (responseData && responseData.length > 0) {
        setResponses(responseData);
        
        const userIds = responseData
          .filter(response => !response.is_anonymous && response.submitted_by)
          .map(response => response.submitted_by);
          
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
            
          if (profilesError) {
            console.error("Error fetching user profiles:", profilesError);
          } else if (profiles) {
            const profileMap: Record<string, any> = {};
            profiles.forEach(profile => {
              profileMap[profile.id] = profile;
            });
            setUserProfiles(profileMap);
          }
        }
      } else {
        setResponses([]);
      }
    } catch (error: any) {
      console.error("Error fetching responses:", error);
      toast.error("Failed to load evidence responses");
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleViewRequest = (request: EvidenceRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleViewResponses = async (request: EvidenceRequest) => {
    setSelectedRequest(request);
    await fetchResponses(request.id);
    setResponsesDialogOpen(true);
  };

  const handleCloseRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('evidence_requests')
        .update({ status: 'closed' })
        .eq('id', requestId);
      
      if (error) throw error;
      
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId ? {...request, status: 'closed'} : request
        )
      );
      
      toast.success("Evidence request has been closed");
    } catch (error: any) {
      console.error("Error closing evidence request:", error);
      toast.error("Failed to close request");
    }
  };

  const handleContactCitizen = async (response: EvidenceResponse) => {
    if (response.is_anonymous) {
      toast.info("Cannot contact anonymous submitters");
      return;
    }

    if (!response.submitted_by) {
      toast.error("User information not available");
      return;
    }

    const userProfile = userProfiles[response.submitted_by];
    if (userProfile && userProfile.phone) {
      window.open(`tel:${userProfile.phone}`, '_blank');
    } else {
      toast.info("Contact information not available for this user");
    }
  };

  const handleViewEvidence = async (response: EvidenceResponse) => {
    if (response.file_url) {
      try {
        if (response.file_url.startsWith('http')) {
          window.open(response.file_url, '_blank');
        } else {
          const { data, error } = supabase.storage
            .from('evidences')
            .getPublicUrl(response.file_url);
            
          if (error) {
            console.error("Error getting file URL:", error);
            toast.error("Error viewing file: " + error.message);
            return;
          }
          
          if (data && data.publicUrl) {
            window.open(data.publicUrl, '_blank');
          } else {
            toast.error("Cannot get file URL");
          }
        }
      } catch (error: any) {
        console.error("Error viewing evidence:", error);
        toast.error("Error viewing file: " + error.message);
      }
    } else {
      toast.info("This response does not include any files");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D2644]" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-6 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No Evidence Requests</h3>
        <p className="text-sm text-gray-500 mb-4">You haven't created any evidence requests yet.</p>
        <Button className="bg-[#0D2644] hover:bg-[#0D2644]/90" to="/officer-dashboard">Create Request</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.slice(0, limit).map((request) => (
        <Card key={request.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0D2644]" />
              <h3 className="font-medium">{request.title}</h3>
            </div>
            <Badge 
              className={``
                ${request.status === 'active' ? 'bg-green-100 text-green-800' : 
                  request.status === 'expired' ? 'bg-amber-100 text-amber-800' : 
                  'bg-gray-100 text-gray-800'}
              `}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between mb-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium">FIR:</span> {request.fir_number}
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Deadline:</span> {format(new Date(request.response_deadline), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              className="text-[#0D2644] border-[#0D2644] hover:bg-[#0D2644]/10"
              onClick={() => handleViewRequest(request)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <Button 
              size="sm" 
              variant={request.responses_count && request.responses_count > 0 ? "default" : "outline"} 
              className={request.responses_count && request.responses_count > 0 ? 
                "bg-[#0D2644] text-white hover:bg-[#0D2644]/90" : 
                "text-gray-500 border-gray-300 hover:bg-gray-50"
              }
              onClick={() => handleViewResponses(request)}
              disabled={!request.responses_count || request.responses_count === 0}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Responses ({request.responses_count || 0})
            </Button>
            
            {request.status === 'active' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-gray-500 border-gray-300 hover:bg-gray-50 ml-auto"
                onClick={() => handleCloseRequest(request.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Close Request
              </Button>
            )}
          </div>
        </Card>
      ))}
      
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Evidence Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">{selectedRequest.title}</h3>
                <Badge 
                  className={``
                    ${selectedRequest.status === 'active' ? 'bg-green-100 text-green-800' : 
                      selectedRequest.status === 'expired' ? 'bg-amber-100 text-amber-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}
                >
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">FIR Number</p>
                  <p>{selectedRequest.fir_number}</p>
                </div>
                
                <div>
                  <p className="font-medium">Location</p>
                  <p>{selectedRequest.location}</p>
                </div>
                
                <div>
                  <p className="font-medium">Incident Date</p>
                  <p>{format(new Date(selectedRequest.incident_date), 'MMM dd, yyyy')}</p>
                </div>
                
                <div>
                  <p className="font-medium">Response Deadline</p>
                  <p>{format(new Date(selectedRequest.response_deadline), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-1">Description</p>
                <p className="text-sm text-gray-600">{selectedRequest.description}</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Request Statistics</p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p>Published: {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p>Responses: {selectedRequest.responses_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest && selectedRequest.status === 'active' && selectedRequest.responses_count && selectedRequest.responses_count > 0 && (
              <Button 
                className="bg-[#0D2644] hover:bg-[#0D2644]/90"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleViewResponses(selectedRequest);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                View Responses
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={responsesDialogOpen} onOpenChange={setResponsesDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Evidence Responses</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div>
              <h3 className="text-base font-medium mb-4">
                {selectedRequest.title} - {selectedRequest.fir_number}
              </h3>
              
              {isLoadingResponses ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0D2644]" />
                </div>
              ) : responses.length > 0 ? (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <Card key={response.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-[#0D2644]" />
                          <h4 className="font-medium text-sm">
                            {response.is_anonymous ? "Anonymous Citizen" : userProfiles[response.submitted_by || '']?.full_name || `User ID: ${response.submitted_by}`}
                          </h4>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {response.file_url ? "File Evidence" : "Text Report"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {response.description}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-[#0D2644] border-[#0D2644] bg-[#0D2644]/10 hover:bg-[#0D2644]/20"
                          onClick={() => handleContactCitizen(response)}
                          disabled={response.is_anonymous}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact Citizen
                        </Button>
                        
                        {response.file_url && (
                          <Button 
                            size="sm" 
                            className="bg-[#0D2644] hover:bg-[#0D2644]/90"
                            onClick={() => handleViewEvidence(response)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Evidence
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Responses Yet</h3>
                  <p className="text-sm text-gray-500">
                    There are no responses to this evidence request yet.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponsesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvidenceRequestsList;
