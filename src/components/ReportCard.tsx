
import React, { useState } from 'react';
import { FileText, ShieldCheck, Clock, MessageSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

type ReportCardProps = {
  className?: string;
  reportId?: string;
  pdfUrl?: string;
  onDownload?: () => void;
  evidenceRequest?: any; // For evidence request data
};

const ReportCard = ({ className, reportId, pdfUrl, onDownload, evidenceRequest }: ReportCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownloadClick = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    try {
      setIsDownloading(true);
      
      if (pdfUrl) {
        console.log("Downloading PDF from URL:", pdfUrl);
        
        // Create an anchor element to trigger the download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Shield-Report-${reportId || 'download'}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        
        // Clean up the DOM
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        // Log download if reportId exists
        if (reportId) {
          try {
            // Record the download in the database
            await supabase.from('pdf_downloads').insert({
              report_id: reportId,
              filename: `Shield-Report-${reportId}.pdf`,
              success: true
            });
          } catch (logError) {
            // Just log the error, but don't show to user as download already worked
            console.error("Failed to log PDF download:", logError);
          }
        }
        
        toast.success("PDF download started");
      } else {
        // If no pdfUrl is provided, fetch the latest PDF for this report
        if (reportId) {
          console.log("Fetching latest PDF for report:", reportId);
          
          const { data: pdfs, error } = await supabase
            .from('report_pdfs')
            .select('*')
            .eq('report_id', reportId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (error) {
            console.error("Error fetching PDF:", error);
            throw new Error(`Failed to fetch PDF: ${error.message}`);
          }
          
          if (pdfs && pdfs.length > 0) {
            const latestPdf = pdfs[0];
            console.log("Found PDF:", latestPdf);
            
            if (!latestPdf.file_url) {
              throw new Error("PDF file URL is missing");
            }
            
            // Create and click download link
            const link = document.createElement('a');
            link.href = latestPdf.file_url;
            link.download = latestPdf.file_name || `Shield-Report-${reportId}.pdf`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            
            // Clean up the DOM
            setTimeout(() => {
              document.body.removeChild(link);
            }, 100);
            
            // Try to call our edge function to update officer materials
            try {
              await supabase.functions.invoke('update-officer-materials', {
                body: {
                  reportId,
                  pdfId: latestPdf.id,
                  pdfName: latestPdf.file_name,
                  pdfUrl: latestPdf.file_url,
                  pdfIsOfficial: latestPdf.is_official || false
                }
              });
            } catch (edgeError) {
              console.error("Failed to update officer materials:", edgeError);
              // Continue, as this is not critical for the download
            }
            
            toast.success("PDF download started");
            return;
          } else {
            console.error("No PDFs found for report:", reportId);
            throw new Error("No PDF available for this report");
          }
        } else {
          toast.error("No PDF available to download");
          console.error("No PDF URL or report ID available for download");
        }
      }
    } catch (error: any) {
      toast.error(`Download failed: ${error.message || "Unknown error"}`);
      console.error("PDF download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // If we have evidence request data, render the evidence request card
  if (evidenceRequest) {
    return (
      <div className={cn('glass-card p-6', className)}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Officer Evidence Request</h3>
          <FileText className="h-5 w-5 text-[#0D2644]" />
        </div>
        
        <div className="rounded-xl bg-shield-light p-5 mb-6">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-[#0D2644]" />
              <span className="text-sm font-medium">{evidenceRequest.fir_number}</span>
            </div>
            <p className="text-sm text-gray-600">
              {evidenceRequest.description}
            </p>
            {evidenceRequest.location && (
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {evidenceRequest.location}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-5 w-5 text-[#0D2644]" />
              <span className="text-sm font-medium">Your evidence will be kept confidential</span>
            </div>
            <p className="text-sm text-gray-500">
              All submissions are encrypted and only accessible to authorized officers.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Request Status</div>
          <div className="flex items-center space-x-2 text-green-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">{evidenceRequest.status === 'active' ? 'Active Investigation' : evidenceRequest.status}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Response Needed By</div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-[#0D2644]" />
            <span className="font-medium">
              {new Date(evidenceRequest.response_deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            className="border-[#0D2644] text-[#0D2644] hover:bg-[#0D2644] hover:text-white transition-all"
            to={`/submit-evidence?requestId=${evidenceRequest.id}`}
          >
            View Details
          </Button>
          <Link to={`/submit-evidence?requestId=${evidenceRequest.id}`}>
            <Button 
              className="bg-[#0D2644] text-white hover:bg-[#0D2644]/90 transition-all"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Submit Evidence
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Default report card - generic content that isn't tied to a specific FIR
  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Officer Evidence Request</h3>
        <FileText className="h-5 w-5 text-[#0D2644]" />
      </div>
      
      <div className="rounded-xl bg-shield-light p-5 mb-6">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-[#0D2644]" />
            <span className="text-sm font-medium">Community Assistance Program</span>
          </div>
          <p className="text-sm text-gray-600">
            Law enforcement agencies regularly publish requests for evidence related to ongoing investigations. 
            Your assistance can help solve cases and bring justice to your community.
          </p>
          <p className="text-sm text-gray-600">
            Check for active evidence requests and submit information securely through our platform.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-5 w-5 text-[#0D2644]" />
            <span className="text-sm font-medium">Your evidence will be kept confidential</span>
          </div>
          <p className="text-sm text-gray-500">
            All submissions are encrypted and only accessible to authorized officers.
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Request Status</div>
        <div className="flex items-center space-x-2 text-green-600">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-medium">Active Program</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Always Available</div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-[#0D2644]" />
          <span className="font-medium">24/7 Secure Submission</span>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          className="border-[#0D2644] text-[#0D2644] hover:bg-[#0D2644] hover:text-white transition-all"
          to="/submit-evidence"
        >
          View Details
        </Button>
        <Link to="/submit-evidence">
          <Button 
            className="bg-[#0D2644] text-white hover:bg-[#0D2644]/90 transition-all"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Submit Evidence
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ReportCard;
