
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Save, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  description?: string;
  location?: string;
  title?: string;
  updated_at?: string;
}

const ContinueReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData>({});
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setReportId(id);
      fetchReportData(id);
    } else {
      // If no report ID is provided, redirect to home
      toast.error("No report found");
      navigate('/');
    }
    
    const savedImages = sessionStorage.getItem('uploadedImages');
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages));
    }
  }, [location.search, navigate]);

  const fetchReportData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crime_reports')
        .select('description, location, title, updated_at')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setReportData(data);
        
        // Also fetch any images/evidence for this report
        const { data: evidenceData, error: evidenceError } = await supabase
          .from('evidence')
          .select('storage_path')
          .eq('report_id', id);
          
        if (!evidenceError && evidenceData && evidenceData.length > 0) {
          const paths = evidenceData.map((item) => item.storage_path).filter(Boolean);
          if (paths.length > 0) {
            sessionStorage.setItem('uploadedImages', JSON.stringify(paths));
            setUploadedImages(paths);
          }
        }
      } else {
        toast.error("Report not found");
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast.error(`Failed to load report data: ${error.message}`);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueEditing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/view-draft-report${reportId ? `?id=${reportId}` : ''}`);
    }, 1500);
  };
  
  const handleViewDraft = () => {
    navigate(`/view-draft-report${reportId ? `?id=${reportId}` : ''}`);
  };
  
  const handleCancelReport = () => {
    navigate(`/cancel-report${reportId ? `?id=${reportId}` : ''}`);
  };
  
  const handleGenerateReport = () => {
    navigate(`/generate-detailed-report${reportId ? `?id=${reportId}` : ''}`);
  };

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shield-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <FileText className="h-4 w-4 text-shield-blue mr-2" />
              <span className="text-xs font-medium">In Progress</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Continue Your Report</h1>
            <p className="text-gray-600 text-lg">
              You have a report in progress. Continue where you left off or take other actions.
            </p>
          </div>
          
          <div className="glass-card p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Report #{reportId}</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created On</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-medium">
                    {reportData.updated_at 
                      ? new Date(reportData.updated_at).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="font-medium">
                  {reportData.title || 'No title provided'}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="font-medium">
                  {reportData.description || 'No description provided'}
                </p>
              </div>

              {reportData.location && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium">{reportData.location}</p>
                </div>
              )}
              
              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Uploaded Evidence</p>
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="aspect-square relative rounded-md overflow-hidden border border-gray-200">
                        <img src={img} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Completion</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div className="bg-shield-blue h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-right text-gray-500">65% complete</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-shield-blue text-white hover:bg-blue-600 transition-all flex-1"
                onClick={handleContinueEditing}
                disabled={isProcessing}
              >
                <Save className="mr-2 h-4 w-4" /> 
                {isProcessing ? "Processing..." : "Continue Editing"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all"
                onClick={handleViewDraft}
              >
                <Eye className="mr-2 h-4 w-4" /> View Draft
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                onClick={handleCancelReport}
              >
                <X className="mr-2 h-4 w-4" /> Cancel Report
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ready to finalize your report?</p>
            <Button 
              size="lg" 
              className="bg-green-600 text-white hover:bg-green-700 transition-all"
              onClick={handleGenerateReport}
            >
              Generate Detailed Report with AI Analysis
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ContinueReport;
