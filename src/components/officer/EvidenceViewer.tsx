
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, File, FileText, Film, Image, AlertCircle, Loader2 } from 'lucide-react';
import { getAllEvidence, getEvidenceById } from '@/services/officerServices';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';

interface EvidenceViewerProps {
  limit?: number;
}

const EvidenceViewer = ({ limit }: EvidenceViewerProps) => {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { officer } = useOfficerAuth();

  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEvidence();
      console.log("Fetched evidence:", data);
      const limitedData = limit ? data.slice(0, limit) : data;
      setEvidence(limitedData);
    } catch (error: any) {
      console.error("Error fetching evidence:", error);
      toast.error("Failed to load evidence", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [limit]);

  const handleViewEvidence = async (id: string) => {
    try {
      const data = await getEvidenceById(id);
      console.log("Selected evidence:", data);
      setSelectedEvidence(data);
      setIsDialogOpen(true);
      
      // Record this evidence view
      if (officer) {
        await supabase.from('evidence_views').insert({
          evidence_id: id,
          officer_id: officer.id.toString(),
          view_complete: false
        });
      }
    } catch (error: any) {
      console.error("Error viewing evidence:", error);
      toast.error("Failed to load evidence details", {
        description: error.message
      });
    }
  };

  const handleDialogClose = async () => {
    if (selectedEvidence && officer) {
      // Update the view as complete
      try {
        await supabase
          .from('evidence_views')
          .update({ view_complete: true })
          .eq('evidence_id', selectedEvidence.id)
          .eq('officer_id', officer.id.toString());
      } catch (error) {
        console.error("Error updating evidence view:", error);
      }
    }
    setIsDialogOpen(false);
  };

  const getEvidenceTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Film className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const renderEvidenceContent = () => {
    if (!selectedEvidence) return null;
    
    const type = selectedEvidence.type?.toLowerCase();
    const url = selectedEvidence.storage_path;
    
    if (!url) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-10 w-10 text-yellow-500 mb-2" />
          <p>Evidence file not available</p>
        </div>
      );
    }
    
    switch (type) {
      case 'image':
        return <img src={url} alt="Evidence" className="max-w-full h-auto rounded-md" />;
      case 'video':
        return (
          <video controls className="w-full rounded-md">
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        );
      case 'document':
        return (
          <div className="text-center py-8">
            <FileText className="mx-auto h-10 w-10 text-blue-500 mb-2" />
            <p>Document available for download</p>
            <Button className="mt-4" onClick={() => window.open(url, '_blank')}>
              <Download className="mr-2 h-4 w-4" /> Download Document
            </Button>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <File className="mx-auto h-10 w-10 text-gray-500 mb-2" />
            <p>File available for download</p>
            <Button className="mt-4" onClick={() => window.open(url, '_blank')}>
              <Download className="mr-2 h-4 w-4" /> Download File
            </Button>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-shield-blue" />
        <span className="ml-2">Loading evidence...</span>
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <File className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No Evidence Available</h3>
        <p className="text-gray-500 mt-2">No evidence has been submitted yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{item.title || 'Untitled Evidence'}</CardTitle>
                <Badge variant={item.report?.status === 'approved' ? 'default' : 'outline'}>
                  {item.report?.status || 'Processing'}
                </Badge>
              </div>
              <CardDescription className="truncate">
                {item.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                {getEvidenceTypeIcon(item.type)}
                <span className="text-sm capitalize">{item.type || 'Unknown'} File</span>
              </div>
              <p className="text-xs text-gray-500">
                Uploaded: {new Date(item.uploaded_at).toLocaleString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center"
                onClick={() => handleViewEvidence(item.id)}
              >
                <Eye className="mr-2 h-4 w-4" /> View Evidence
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvidence?.title || 'Evidence Details'}</DialogTitle>
            <DialogDescription>
              {selectedEvidence?.description || 'No description available'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="evidence" className="mt-4">
            <TabsList>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="report">Report Info</TabsTrigger>
            </TabsList>

            <TabsContent value="evidence" className="py-4">
              <div className="border rounded-md overflow-hidden p-2">
                {renderEvidenceContent()}
              </div>
            </TabsContent>

            <TabsContent value="details" className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Evidence Type</h3>
                  <p className="capitalize">{selectedEvidence?.type || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Uploaded At</h3>
                  <p>{selectedEvidence?.uploaded_at ? new Date(selectedEvidence.uploaded_at).toLocaleString() : 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p>{selectedEvidence?.description || 'No description provided'}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="report" className="py-4">
              {selectedEvidence?.report ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report Title</h3>
                    <p>{selectedEvidence.report.title || 'Untitled Report'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report Status</h3>
                    <Badge variant={selectedEvidence.report.status === 'approved' ? 'default' : 'outline'}>
                      {selectedEvidence.report.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Report Date</h3>
                    <p>{selectedEvidence.report.report_date ? new Date(selectedEvidence.report.report_date).toLocaleString() : 'Unknown'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Incident Location</h3>
                    <p>{selectedEvidence.report.location || 'No location provided'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No related report information available
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-4 space-x-2">
            {selectedEvidence?.storage_path && (
              <Button variant="outline" onClick={() => window.open(selectedEvidence.storage_path, '_blank')}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            )}
            <Button onClick={handleDialogClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvidenceViewer;
